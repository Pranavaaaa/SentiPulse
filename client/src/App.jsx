import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import Header from './components/Header';
import Hero from './components/Hero';
import VideoUpload from './components/VideoUpload';
import Results from './components/Results';
import ProcessingStatus from './components/ProcessingStatus';
import  useWebSocket  from './hooks/useWebSocket';
import './App.css';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentView, setCurrentView] = useState('home');
  const [processingData, setProcessingData] = useState(null);
  const [results, setResults] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // WebSocket connection for real-time updates
  const { socket, isConnected } = useWebSocket('ws://localhost:8080');

  // Handle WebSocket messages
  useEffect(() => {
    if (socket) {
      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
          case 'processing_start':
            setProcessingData(data);
            setIsProcessing(true);
            setCurrentView('processing');
            break;
          case 'processing_complete':
            setResults(data.result);
            setIsProcessing(false);
            setCurrentView('results');
            break;
          case 'processing_error':
            setProcessingData({ ...data, error: true });
            setIsProcessing(false);
            setCurrentView('error');
            break;
          default:
            break;
        }
      };
    }
  }, [socket]);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.body.classList.toggle('dark', !isDarkMode);
  };

  // Handle video upload
  const handleVideoUpload = (uploadData) => {
    setProcessingData(uploadData);
    setIsProcessing(true);
    
    // Always check for results first
    if (uploadData.result && uploadData.result.heart_rate !== undefined) {
      console.log('Direct results available, showing immediately');
      setResults(uploadData.result);
      setIsProcessing(false);
      setCurrentView('results');
    } else {
      console.log('No direct results, showing processing view');
      setCurrentView('processing');
    }
  };

  // Handle processing completion
  const handleProcessingComplete = (result) => {
    setResults(result);
    setIsProcessing(false);
    setCurrentView('results');
  };

  // Handle processing error
  const handleProcessingError = (error) => {
    setProcessingData({ error: true, message: error.message });
    setIsProcessing(false);
    setCurrentView('error');
  };

  // Reset to home view
  const resetToHome = () => {
    setCurrentView('home');
    setProcessingData(null);
    setResults(null);
    setIsProcessing(false);
  };

  // Apply dark mode class on mount
  useEffect(() => {
    document.body.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  return (
    <div className="App">
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: isDarkMode ? '#1f1b24' : '#ffffff',
            color: isDarkMode ? '#ffffff' : '#333333',
            border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
          },
        }}
      />
      
      {/* <Header 
        isDarkMode={isDarkMode} 
        onToggleDarkMode={toggleDarkMode}
        onReset={resetToHome}
        currentView={currentView}
      /> */}

      <main className="main-content">
        {currentView === 'home' && (
          <Hero onStartProcessing={() => setCurrentView('upload')} />
        )}

        {currentView === 'upload' && (
          <VideoUpload 
            onUpload={handleVideoUpload}
            onError={handleProcessingError}
            onBack={() => setCurrentView('home')}
          />
        )}

        {currentView === 'processing' && (
          <ProcessingStatus 
            processingData={processingData}
            isConnected={isConnected}
            onError={handleProcessingError}
            onComplete={handleProcessingComplete}
          />
        )}

        {currentView === 'results' && results && (
          <Results 
            results={results}
            onTryAgain={resetToHome}
          />
        )}

        {currentView === 'error' && (
          <div className="error-container">
            <div className="card">
              <div className="card-body text-center">
                <h2 className="text-red-600 mb-4">Processing Error</h2>
                <p className="mb-6">
                  {processingData?.message || 'An unexpected error occurred during video processing.'}
                </p>
                <button 
                  className="btn btn-primary"
                  onClick={resetToHome}
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
