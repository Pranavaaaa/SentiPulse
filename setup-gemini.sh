#!/bin/bash

echo "Setting up Gemini API for Mental Health Support..."
echo

# Check if .env file exists
if [ ! -f .env ]; then
    echo "Creating .env file from env.example..."
    cp env.example .env
    echo ".env file created successfully!"
else
    echo ".env file already exists."
fi

echo
echo "========================================"
echo "GEMINI API SETUP INSTRUCTIONS"
echo "========================================"
echo
echo "1. Visit: https://makersuite.google.com/app/apikey"
echo "2. Sign in with your Google account"
echo "3. Click 'Create API Key'"
echo "4. Copy the generated API key"
echo "5. Open the .env file in this directory"
echo "6. Replace 'your_gemini_api_key_here' with your actual API key"
echo
echo "Example:"
echo "GEMINI_API_KEY=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
echo
echo "After setting up your API key, restart the server:"
echo "npm run dev"
echo
echo "========================================"
echo
