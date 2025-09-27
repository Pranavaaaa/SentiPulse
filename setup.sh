#!/bin/bash

# Physiological Monitoring System Setup Script
echo "🚀 Setting up Physiological Monitoring System..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"
echo "✅ Python $(python3 --version) detected"

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd client
npm install
cd ..

# Install Python dependencies
echo "📦 Installing Python dependencies..."
cd python_services
pip3 install -r requirements.txt
cd ..

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p server/uploads
mkdir -p python_services/static

# Copy environment file if it doesn't exist
if [ ! -f .env ]; then
    echo "📄 Creating .env file..."
    cp env.example .env
    echo "✅ .env file created. You may need to modify it for your setup."
fi

# Set permissions for Python script
chmod +x python_services/process_video.py

echo ""
echo "🎉 Setup complete!"
echo ""
echo "To start the development servers:"
echo "  npm run dev"
echo ""
echo "To start individual services:"
echo "  npm run server:dev  # Express server only"
echo "  npm run client:dev  # React dev server only"
echo ""
echo "The application will be available at:"
echo "  Frontend: http://localhost:5173"
echo "  Backend API: http://localhost:3000"
echo "  WebSocket: ws://localhost:8080"
echo ""
echo "For production deployment:"
echo "  npm run build"
echo "  npm start"
echo ""
echo "Or use Docker:"
echo "  docker-compose up"
