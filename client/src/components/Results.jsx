import React, { useState } from 'react';
import { Heart, Download, RotateCcw, Eye, EyeOff, TrendingUp, MessageCircle } from 'lucide-react';
import SupportModal from './SupportModal';
import './css/Results.css';

const Results = ({ results, onTryAgain }) => {
  const [showPlots, setShowPlots] = useState(true);
  const [selectedPlot, setSelectedPlot] = useState(null);
  const [showSupportModal, setShowSupportModal] = useState(false);

  if (!results) {
    return (
      <div className="results-container">
        <div className="card">
          <div className="card-body text-center">
            <h2 className="no-results-title">No Results Available</h2>
            <p className="no-results-text">
              No processing results were found.
            </p>
            <button onClick={onTryAgain} className="btn btn-primary">
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { heart_rate, method, plots, error } = results;

  if (error) {
    return (
      <div className="results-container">
        <div className="card">
          <div className="card-body text-center">
            <div className="error-icon">
              <Heart size={48} />
            </div>
            <h2 className="error-title">Processing Failed</h2>
            <p className="error-text">{error}</p>
            <button onClick={onTryAgain} className="btn btn-primary">
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const getHeartRateStatus = (bpm) => {
    if (bpm < 60) return { status: 'Low', className: 'status-low' };
    if (bpm > 100) return { status: 'High', className: 'status-high' };
    return { status: 'Normal', className: 'status-normal' };
  };

  const heartRateStatus = getHeartRateStatus(heart_rate);

  return (
    <div className="results-container">
      {/* Main Results Card */}
      <div className="card results-card animate-slide-in-up">
        <div className="card-header">
          <div className="header-left">
            <div className="icon-box">
              <Heart size={32} className="icon" />
            </div>
            <div>
              <h2 className="card-title">Analysis Results</h2>
              <p className="card-subtitle">Your physiological analysis is complete</p>
            </div>
          </div>
          <div className="header-right">
            <button
              onClick={() => setShowPlots(!showPlots)}
              className="btn btn-outline"
            >
              {showPlots ? <EyeOff size={20} /> : <Eye size={20} />}
              {showPlots ? 'Hide' : 'Show'} Plots
            </button>
            <button onClick={onTryAgain} className="btn btn-primary">
              <RotateCcw size={20} />
              Try Again
            </button>
          </div>
        </div>

        <div className="card-body">
          {/* Heart Rate Display */}
          <div className="heart-rate-section">
            <div className="heart-rate-box">
              <div className="heart-icon-box">
                <Heart size={64} className="heart-icon" />
              </div>
              <div>
                <div className="heart-rate-value">{heart_rate}</div>
                <div className="heart-rate-text">Beats per minute</div>
              </div>
            </div>
            <div className={`heart-rate-status ${heartRateStatus.className}`}>
              <TrendingUp size={20} />
              <span>{heartRateStatus.status} Heart Rate</span>
            </div>
          </div>

          {/* Method and Details */}
          <div className="details-grid">
            <div className="detail-card method">
              <div className="detail-label">Processing Method</div>
              <div className="detail-value">{method}</div>
            </div>

            <div className="detail-card confidence">
              <div className="detail-label">Confidence Level</div>
              <div className="detail-value">High</div>
            </div>

            <div className="detail-card time">
              <div className="detail-label">Analysis Time</div>
              <div className="detail-value">~20s</div>
            </div>
          </div>
        </div>
      </div>

      {/* Plots Section */}
      {showPlots && plots && (
        <div className="card plots-card">
          <div className="card-header">
            <h3 className="plots-title">Signal Analysis Visualizations</h3>
            <p className="plots-subtitle">
              Detailed breakdown of the physiological signal processing
            </p>
          </div>
          <div className="card-body">
            <div className="plots-grid">
              {plots.red_channel && (
                <div className="plot-item">
                  <h4 className="plot-label red">Red Channel Signal</h4>
                  <img
                    src={plots.red_channel}
                    alt="Red Channel Signal"
                    className="plot-image"
                    onClick={() => setSelectedPlot(plots.red_channel)}
                  />
                </div>
              )}

              {plots.green_channel && (
                <div className="plot-item">
                  <h4 className="plot-label green">Green Channel Signal</h4>
                  <img
                    src={plots.green_channel}
                    alt="Green Channel Signal"
                    className="plot-image"
                    onClick={() => setSelectedPlot(plots.green_channel)}
                  />
                </div>
              )}

              {plots.blue_channel && (
                <div className="plot-item">
                  <h4 className="plot-label blue">Blue Channel Signal</h4>
                  <img
                    src={plots.blue_channel}
                    alt="Blue Channel Signal"
                    className="plot-image"
                    onClick={() => setSelectedPlot(plots.blue_channel)}
                  />
                </div>
              )}

              {plots.signal && (
                <div className="plot-item">
                  <h4 className="plot-label purple">{method} Processed Signal</h4>
                  <img
                    src={plots.signal}
                    alt={`${method} Processed Signal`}
                    className="plot-image"
                    onClick={() => setSelectedPlot(plots.signal)}
                  />
                </div>
              )}

              {plots.fft && (
                <div className="plot-item">
                  <h4 className="plot-label orange">FFT Spectrum</h4>
                  <img
                    src={plots.fft}
                    alt="FFT Spectrum"
                    className="plot-image"
                    onClick={() => setSelectedPlot(plots.fft)}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Plot Modal */}
      {selectedPlot && (
        <div
          className="plot-modal"
          onClick={() => setSelectedPlot(null)}
        >
          <div className="plot-modal-content">
            <div className="plot-modal-header">
              <h3>Plot Viewer</h3>
              <button
                onClick={() => setSelectedPlot(null)}
                className="close-btn"
              >
                ✕
              </button>
            </div>
            <div className="plot-modal-body">
              <img src={selectedPlot} alt="Plot" />
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="results-actions">
        <button onClick={onTryAgain} className="btn btn-primary">
          <RotateCcw size={20} />
          Analyze Another Video
        </button>
        <button
          onClick={() => setShowSupportModal(true)}
          className="btn btn-support"
        >
          <MessageCircle size={20} />
          Get Health Support
        </button>
        <button
          onClick={() => window.print()}
          className="btn btn-outline"
        >
          <Download size={20} />
          Print Results
        </button>
      </div>

      {/* Support Modal */}
      {showSupportModal && (
        <SupportModal
          results={results}
          onClose={() => setShowSupportModal(false)}
        />
      )}
    </div>
  );
};

export default Results;
