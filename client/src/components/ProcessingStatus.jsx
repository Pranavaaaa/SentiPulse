import React, { useState, useEffect } from 'react';
import { Activity, Wifi, WifiOff, AlertCircle, Clock } from 'lucide-react';
import './css/ProcessingStatus.css';

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

  // Simulate progress
  useEffect(() => {
    if (!isProcessing) return;
    let stepIndex = 0;
    let intervalId = setInterval(() => {
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

    const timeout = setTimeout(() => {
      if (isProcessing) {
        onError(new Error('Processing timeout. Please try again with a shorter video.'));
      }
    }, 120000);

    return () => {
      clearInterval(intervalId);
      clearTimeout(timeout);
    };
  }, [isProcessing]);

  // Elapsed time
  useEffect(() => {
    if (!isProcessing) return;
    const intervalId = setInterval(() => setTimeElapsed((prev) => prev + 1000), 1000);
    return () => clearInterval(intervalId);
  }, [isProcessing]);

  // Fallback completion
  useEffect(() => {
    if (!isProcessing || progress < 95) return;
    const fallbackTimeout = setTimeout(() => {
      if (onComplete) {
        onComplete({ fallback: true, message: 'Processing completed via fallback' });
      }
    }, 30000);
    return () => clearTimeout(fallbackTimeout);
  }, [progress, isProcessing, onComplete]);

  // Handle signals
  useEffect(() => {
    if (processingData) {
      if (processingData.type === 'processing_complete') {
        setIsProcessing(false);
        setProgress(100);
        setCurrentStep('Processing complete!');
        if (onComplete && processingData.result) {
          setTimeout(() => onComplete(processingData.result), 1000);
        }
      } else if (processingData.type === 'processing_error') {
        setIsProcessing(false);
        onError(new Error(processingData.error || 'Processing failed'));
      }
    }
  }, [processingData, onError, onComplete]);

  const formatTime = (ms) => {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    return `${m}:${(s % 60).toString().padStart(2, '0')}`;
  };

  return (
    <div className="processing-container">
      <div className="card animate-in">
        {/* Header */}
        <div className="card-header">
          <div className="header-left">
            <div className="icon-box">
              <Activity className="pulse-icon" size={28} />
            </div>
            <div>
              <h2 className="title">Processing Video</h2>
              <p className="subtitle">Analyzing your video for physiological signals...</p>
            </div>
          </div>
          <div className={`connection-box ${isConnected ? 'connected' : 'disconnected'}`}>
            {isConnected ? <Wifi size={20} /> : <WifiOff size={20} />}
            <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
        </div>

        <div className="card-body">
          {/* Progress */}
          <div className="progress-section">
            <div className="progress-header">
              <span>Processing Progress</span>
              <span className="progress-value">{Math.round(progress)}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>

          {/* Current step */}
          <div className="current-step">
            <div className="step-header">
              <Clock size={20} />
              <span>Current Step</span>
            </div>
            <div className="step-box">
              <div className="spinner" />
              <span>{currentStep}</span>
            </div>
          </div>

          {/* Details */}
          <div className="details-grid">
            <div className="detail-box method">
              <div className="label">Processing Method</div>
              <div className="value">{processingData?.method?.toUpperCase() || 'ICA'}</div>
            </div>
            <div className="detail-box time">
              <div className="label">Time Elapsed</div>
              <div className="value">{formatTime(timeElapsed)}</div>
            </div>
          </div>

          {/* Steps */}
          <div className="steps-list">
            <h3>Processing Steps</h3>
            {steps.map((step, i) => {
              const isDone = progress >= step.progress;
              const isNow = currentStep === step.name;
              return (
                <div key={i} className={`step-item ${isDone ? 'done' : isNow ? 'current' : ''}`}>
                  <div className="step-circle">{isDone ? '✓' : i + 1}</div>
                  <span>{step.name}</span>
                  {isNow && !isDone && <div className="spinner small" />}
                </div>
              );
            })}
          </div>

          {/* Connection lost */}
          {!isConnected && (
            <div className="connection-warning">
              <AlertCircle size={20} />
              <div>
                <div className="warning-title">Connection Lost</div>
                <div className="warning-msg">
                  Processing continues in the background. Results will be displayed when complete.
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
