const express = require('express');
const multer = require('multer');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs-extra');
const { v4: uuidv4 } = require('uuid');
const WebSocket = require('ws');
const { spawn } = require('child_process');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'YOUR_GEMINI_API_KEY_HERE');

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? false : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    fs.ensureDirSync(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed'), false);
    }
  }
});

// Serve static files from React build
app.use(express.static(path.join(__dirname, '../client/dist')));

// Serve uploaded files and generated plots
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/static', express.static(path.join(__dirname, '../python_services/static')));

// WebSocket server for real-time updates
const wss = new WebSocket.Server({ port: 8080 });
const clients = new Map();

wss.on('connection', (ws, req) => {
  const clientId = uuidv4();
  clients.set(clientId, ws);
  
  ws.on('close', () => {
    clients.delete(clientId);
  });
  
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    clients.delete(clientId);
  });
});

// Broadcast function for real-time updates
function broadcastToClients(data) {
  const message = JSON.stringify(data);
  clients.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(message);
    }
  });
}

// API Routes

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Video processing endpoint
app.post('/api/process-video', upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        error: 'No video file provided' 
      });
    }

    const { method = 'ica' } = req.body;
    const videoPath = req.file.path;
    const sessionId = uuidv4();

    // Broadcast processing start
    broadcastToClients({
      type: 'processing_start',
      sessionId,
      message: 'Video processing started...'
    });

    // Call Python processing script
    console.log('Starting Python processing...');
    console.log('Video path:', videoPath);
    console.log('Method:', method);
    
    const pythonProcess = spawn('python', [
      path.join(__dirname, '../python_services/process_video.py'),
      videoPath,
      method
    ], {
      cwd: path.join(__dirname, '../python_services'),
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let output = '';
    let errorOutput = '';

    pythonProcess.stdout.on('data', (data) => {
      const chunk = data.toString();
      console.log('Python stdout:', chunk);
      output += chunk;
    });

    pythonProcess.stderr.on('data', (data) => {
      const chunk = data.toString();
      console.error('Python stderr:', chunk);
      errorOutput += chunk;
    });

    // Set a timeout for the Python process (5 minutes)
    const timeout = setTimeout(() => {
      pythonProcess.kill('SIGTERM');
      console.error('Python process timeout after 5 minutes');
    }, 5 * 60 * 1000);

    pythonProcess.on('close', async (code) => {
      clearTimeout(timeout);
      console.log('Python process closed with code:', code);
      console.log('Output:', output);
      console.log('Error output:', errorOutput);
      
      try {
        if (code !== 0) {
          throw new Error(`Python process exited with code ${code}: ${errorOutput}`);
        }

        if (!output.trim()) {
          throw new Error('No output received from Python process');
        }

        const result = JSON.parse(output);
        
        // Clean up uploaded file after processing
        await fs.remove(videoPath);

        // Broadcast processing complete
        console.log('Broadcasting processing complete to', clients.size, 'clients');
        broadcastToClients({
          type: 'processing_complete',
          sessionId,
          result
        });

        res.json({
          ...result,
          sessionId
        });

      } catch (error) {
        console.error('Processing error:', error);
        
        // Clean up uploaded file on error
        await fs.remove(videoPath).catch(console.error);
        
        // Broadcast error
        broadcastToClients({
          type: 'processing_error',
          sessionId,
          error: error.message
        });

        res.status(500).json({
          success: false,
          error: 'Video processing failed',
          details: error.message
        });
      }
    });

    // Handle process errors
    pythonProcess.on('error', async (error) => {
      console.error('Failed to start Python process:', error);
      
      // Clean up uploaded file
      await fs.remove(videoPath).catch(console.error);
      
      res.status(500).json({
        success: false,
        error: 'Failed to start video processing',
        details: error.message
      });
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      error: 'File upload failed',
      details: error.message
    });
  }
});

// Get processing status (for polling if WebSocket not available)
app.get('/api/status/:sessionId', (req, res) => {
  // This would typically check a database or cache for status
  // For now, return a simple response
  res.json({ 
    status: 'completed',
    message: 'Processing status endpoint - use WebSocket for real-time updates'
  });
});

// Gemini AI Chat endpoint for mental health support
app.post('/api/gemini-chat', async (req, res) => {
  try {
    const { message, results, conversationHistory } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    // Check if API key is configured
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
      return res.status(500).json({
        success: false,
        error: 'Gemini API key not configured. Please set GEMINI_API_KEY environment variable.'
      });
    }

    // Create the model
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Build context for CBT-based responses
    let contextPrompt = `You are a compassionate mental health support assistant specializing in Cognitive Behavioral Therapy (CBT). You provide supportive, evidence-based guidance while maintaining professional boundaries.

IMPORTANT: You are NOT a replacement for professional medical or mental health care. Always encourage users to seek professional help when appropriate.

User's physiological data:
- Heart Rate: ${results?.heart_rate || 'Not available'} BPM
- Processing Method: ${results?.method || 'Not available'}

Previous conversation context:
${conversationHistory?.slice(-5).map(msg => 
  `${msg.type === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
).join('\n') || 'No previous conversation'}

Current user message: ${message}

Please respond as a CBT-based mental health support assistant. Focus on:
1. Acknowledging their feelings and concerns
2. Providing practical CBT techniques (thought challenging, behavioral activation, etc.)
3. Offering coping strategies based on their physiological data
4. Encouraging professional help when appropriate
5. Being supportive and non-judgmental

Keep your response concise but helpful (1-2 paragraphs max) and don't repeat yourself and also don't use bold words and also don't use emojis. Don't respond to the user's message if it's not related to the user's physiological data or the user's concerns.`;

    const result = await model.generateContent(contextPrompt);
    const response = await result.response;
    const text = response.text();

    res.json({
      success: true,
      response: text
    });

  } catch (error) {
    console.error('Gemini API error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get response from support assistant',
      details: error.message
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File too large. Maximum size is 100MB.'
      });
    }
  }
  
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// Catch-all handler for React routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 WebSocket server running on port 8080`);
  console.log(`🌐 Open http://localhost:${PORT} to view the application`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});
