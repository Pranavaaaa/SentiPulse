# Physiological Monitoring System

A modern full-stack application for real-time physiological and emotional state monitoring using computer vision and signal processing.

## Features

- **Contactless Heart Rate Estimation**: Uses rPPG (remote photoplethysmography) technology
- **Advanced Signal Processing**: ICA/PCA algorithms for signal extraction and filtering
- **Real-time Processing**: WebSocket-based real-time updates during video processing
- **Modern UI**: React frontend with responsive design and dark mode support
- **Scalable Architecture**: Express.js backend with Python microservice integration
- **Privacy-focused**: Local processing with secure file handling

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend │    │  Express.js API │    │ Python Processor│
│   (Port 5173)   │◄──►│   (Port 3000)   │◄──►│   (Microservice)│
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐              │
         └──────────────►│  WebSocket      │◄─────────────┘
                        │  (Port 8080)    │
                        └─────────────────┘
```

## Technology Stack

### Frontend
- **React 18** with Vite for fast development
- **Tailwind CSS** for styling
- **React Dropzone** for file uploads
- **Recharts** for data visualization
- **WebSocket** for real-time updates

### Backend
- **Express.js** for API server
- **Multer** for file upload handling
- **WebSocket** for real-time communication
- **Helmet** for security
- **Rate limiting** for API protection

### Processing
- **Python** with OpenCV for video processing
- **NumPy/SciPy** for signal processing
- **scikit-learn** for ICA/PCA algorithms
- **Matplotlib** for plot generation

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Python 3.8+ with pip
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd physiological-monitoring-system
   ```

2. **Install all dependencies**
   ```bash
   npm run install:all
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env file if needed
   ```

4. **Start the development servers**
   ```bash
   npm run dev
   ```

This will start:
- Express server on http://localhost:3000
- React development server on http://localhost:5173
- WebSocket server on port 8080

### Manual Setup

If you prefer to set up each part manually:

1. **Backend Setup**
   ```bash
   npm install
   node server/index.js
   ```

2. **Frontend Setup**
   ```bash
   cd client
   npm install
   npm run dev
   ```

3. **Python Dependencies**
   ```bash
   cd python_services
   pip install -r requirements.txt
   ```

## Usage

1. **Open the application** in your browser at http://localhost:5173
2. **Select processing method** (ICA or PCA)
3. **Upload a video file** (MP4, AVI, MOV, WebM up to 100MB)
4. **Monitor real-time processing** via WebSocket updates
5. **View results** including heart rate estimation and signal visualizations

## API Endpoints

### REST API

- `GET /api/health` - Health check
- `POST /api/process-video` - Process video file
- `GET /api/status/:sessionId` - Get processing status

### WebSocket

- `ws://localhost:8080` - Real-time processing updates

## File Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── hooks/          # Custom hooks
│   │   ├── services/       # API services
│   │   └── App.jsx         # Main app component
│   └── package.json
├── server/                 # Express.js backend
│   ├── index.js           # Main server file
│   └── uploads/           # Uploaded files (auto-created)
├── python_services/        # Python processing
│   ├── process_video.py   # Main processing script
│   ├── heart_rate_model.py # Signal processing logic
│   ├── static/            # Generated plots
│   └── requirements.txt
└── package.json           # Root package.json
```

## Development

### Available Scripts

- `npm run dev` - Start all development servers
- `npm run server:dev` - Start only Express server
- `npm run client:dev` - Start only React development server
- `npm run build` - Build React app for production
- `npm start` - Start production server

### Code Structure

- **Frontend**: Component-based architecture with hooks for state management
- **Backend**: RESTful API with middleware for security and file handling
- **Processing**: Modular Python scripts with clear separation of concerns

## Production Deployment

### Environment Variables

Set the following environment variables for production:

```bash
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://yourdomain.com
```

### Build and Deploy

1. **Build the React app**
   ```bash
   npm run build
   ```

2. **Start the production server**
   ```bash
   npm start
   ```

3. **Configure reverse proxy** (nginx/Apache) to serve the application

## Future Enhancements

### Planned Features

- **Multimodal Analysis**: Voice tone analysis and facial emotion detection
- **Real-time Streaming**: Live video processing capabilities
- **Machine Learning**: CNN-based emotion detection and stress analysis
- **CBT Integration**: Cognitive Behavioral Therapy support features
- **Mobile App**: React Native mobile application
- **Database Integration**: User profiles and historical data storage
- **Cloud Deployment**: Docker containerization and cloud hosting

### Technical Improvements

- **Performance**: GPU acceleration for video processing
- **Security**: JWT authentication and user management
- **Monitoring**: Application performance monitoring and logging
- **Testing**: Comprehensive unit and integration tests
- **Documentation**: API documentation with Swagger/OpenAPI

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation and FAQ
- Contact the development team

## Acknowledgments

- OpenCV community for computer vision tools
- SciPy/NumPy teams for scientific computing
- React and Express.js communities
- All contributors and testers
