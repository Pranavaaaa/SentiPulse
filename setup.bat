@echo off
echo 🚀 Setting up Physiological Monitoring System...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python is not installed. Please install Python 3.8+ first.
    pause
    exit /b 1
)

echo ✅ Node.js detected
echo ✅ Python detected

REM Install root dependencies
echo 📦 Installing root dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install root dependencies
    pause
    exit /b 1
)

REM Install frontend dependencies
echo 📦 Installing frontend dependencies...
cd client
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install frontend dependencies
    pause
    exit /b 1
)
cd ..

REM Install Python dependencies
echo 📦 Installing Python dependencies...
cd python_services
call pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo ❌ Failed to install Python dependencies
    pause
    exit /b 1
)
cd ..

REM Create necessary directories
echo 📁 Creating necessary directories...
if not exist "server\uploads" mkdir "server\uploads"
if not exist "python_services\static" mkdir "python_services\static"

REM Copy environment file if it doesn't exist
if not exist ".env" (
    echo 📄 Creating .env file...
    copy "env.example" ".env"
    echo ✅ .env file created. You may need to modify it for your setup.
)

echo.
echo 🎉 Setup complete!
echo.
echo To start the development servers:
echo   npm run dev
echo.
echo To start individual services:
echo   npm run server:dev  # Express server only
echo   npm run client:dev  # React dev server only
echo.
echo The application will be available at:
echo   Frontend: http://localhost:5173
echo   Backend API: http://localhost:3000
echo   WebSocket: ws://localhost:8080
echo.
echo For production deployment:
echo   npm run build
echo   npm start
echo.
echo Or use Docker:
echo   docker-compose up
echo.
pause
