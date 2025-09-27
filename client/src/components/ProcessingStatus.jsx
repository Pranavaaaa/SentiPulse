import React, { useState, useEffect } from 'react';
import { Activity, Wifi, WifiOff, AlertCircle, Clock } from 'lucide-react';

const ProcessingStatus = ({ processingData, isConnected, onError, onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('Initializing...');
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isProcessing, setIsProcessing] = useState(true);

  const steps = [
    { name: 'Initializing...', progress: 5 },
    { name: 'Detecting face region...', progress: 15 },
    { name: 'Extracting RGB signals...', progress: 35 },
    { name: 'Applying signal processing...', progress: 60 },
    { name: 'Computing FFT analysis...', progress: 80 },
    { name: 'Estimating heart rate...', progress: 90 },
    { name: 'Generating visualizations...', progress: 95 },
    { name: 'Finalizing results...', progress: 100 }
  ];

  // Simulate progress steps
  useEffect(() => {
    if (!isProcessing) return; 
    
    let stepIndex = 0;
    let intervalId = null;
    
    const startProgress = () => {
      intervalId = setInterval(() => {
        if (stepIndex < steps.length) {
          setCurrentStep(steps[stepIndex].name);
          setProgress(steps[stepIndex].progress);
          stepIndex++;
        } else {
          setCurrentStep('Processing in progress...');
          setProgress(95);
          clearInterval(intervalId);
        }
      }, 2000);
    };

    startProgress();

    const timeout = setTimeout(() => {
      if (isProcessing) {
        onError(new Error('Processing timeout. Please try again with a shorter video.'));
      }
    }, 120000); // 2 min timeout

    return () => {
      if (intervalId) clearInterval(intervalId);
      clearTimeout(timeout);
    };
  }, [isProcessing]);

  // ⏱️ Track elapsed time
  useEffect(() => {
    if (!isProcessing) return;

    const intervalId = setInterval(() => {
      setTimeElapsed((prev) => prev + 1000); // increment by 1s
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isProcessing]);

  // Fallback when stuck at 95%
  useEffect(() => {
    if (!isProcessing || progress < 95) return;
    
    const fallbackTimeout = setTimeout(() => {
      console.log('ProcessingStatus: Fallback timeout - assuming completion');
      if (onComplete) {
        onComplete({ fallback: true, message: 'Processing completed via fallback' });
      }
    }, 30000); // 30s after reaching 95%

    return () => clearTimeout(fallbackTimeout);
  }, [progress, isProcessing, onComplete]);

  // Handle real-time updates
  useEffect(() => {
    if (processingData) {
      if (processingData.type === 'processing_complete') {
        console.log('ProcessingStatus: Received completion signal');
        setIsProcessing(false);
        setProgress(100);
        setCurrentStep('Processing complete!');
        
        if (onComplete && processingData.result) {
          setTimeout(() => {
            onComplete(processingData.result);
          }, 1000);
        }
      } else if (processingData.type === 'processing_error') {
        console.log('ProcessingStatus: Received error signal');
        setIsProcessing(false);
        onError(new Error(processingData.error || 'Processing failed'));
      }
    }
  }, [processingData, onError, onComplete]);

  const formatTime = (milliseconds) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="container max-w-4xl mx-auto px-4">
      <div className="card animate-slide-in-up">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600">
                <Activity className="text-white animate-pulse" size={28} />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white">Processing Video</h2>
                <p className="text-white/80 mt-1">
                  Analyzing your video for physiological signals...
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm">
              {isConnected ? (
                <Wifi className="text-green-400" size={20} />
              ) : (
                <WifiOff className="text-red-400" size={20} />
              )}
              <span className="text-sm font-medium text-white">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>

        <div className="card-body">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold text-white">
                Processing Progress
              </span>
              <span className="text-2xl font-bold text-white bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="progress">
              <div 
                className="progress-bar"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Current Step */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="text-blue-400" size={20} />
              <span className="text-lg font-semibold text-white">
                Current Step
              </span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="flex items-center gap-4">
                <div className="spinner" />
                <span className="text-lg text-white font-medium">
                  {currentStep}
                </span>
              </div>
            </div>
          </div>

          {/* Processing Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm rounded-2xl p-6 border border-blue-400/30">
              <div className="text-sm font-semibold text-blue-300 mb-2 uppercase tracking-wide">
                Processing Method
              </div>
              <div className="text-2xl font-bold text-white">
                {processingData?.method?.toUpperCase() || 'ICA'}
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-sm rounded-2xl p-6 border border-green-400/30">
              <div className="text-sm font-semibold text-green-300 mb-2 uppercase tracking-wide">
                Time Elapsed
              </div>
              <div className="text-2xl font-bold text-white">
                {formatTime(timeElapsed)}
              </div>
            </div>
          </div>

          {/* Processing Steps */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
              Processing Steps
            </h3>
            <div className="space-y-2">
              {steps.map((step, index) => {
                const isCompleted = progress >= step.progress;
                const isCurrent = currentStep === step.name;
                
                return (
                  <div 
                    key={index}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                      isCompleted 
                        ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                        : isCurrent
                        ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                        : 'bg-gray-50 dark:bg-gray-800'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      isCompleted 
                        ? 'bg-green-500 text-white'
                        : isCurrent
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
                    }`}>
                      {isCompleted ? '✓' : index + 1}
                    </div>
                    <span className={`text-sm ${
                      isCompleted 
                        ? 'text-green-800 dark:text-green-200'
                        : isCurrent
                        ? 'text-blue-800 dark:text-blue-200 font-medium'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}>
                      {step.name}
                    </span>
                    {isCurrent && !isCompleted && (
                      <div className="ml-auto">
                        <div className="spinner" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Connection Status */}
          {!isConnected && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="text-yellow-600" size={20} />
                <div>
                  <div className="font-medium text-yellow-800 dark:text-yellow-200">
                    Connection Lost
                  </div>
                  <div className="text-sm text-yellow-700 dark:text-yellow-300">
                    Processing continues in the background. Results will be displayed when complete.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProcessingStatus;
