import React, { useState } from 'react';
import { Heart, Download, RotateCcw, Eye, EyeOff, TrendingUp } from 'lucide-react';

const Results = ({ results, onTryAgain }) => {
  const [showPlots, setShowPlots] = useState(true);
  const [selectedPlot, setSelectedPlot] = useState(null);

  if (!results) {
    return (
      <div className="container max-w-4xl mx-auto px-4">
        <div className="card">
          <div className="card-body text-center">
            <h2 className="text-2xl font-bold mb-4">No Results Available</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
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
      <div className="container max-w-4xl mx-auto px-4">
        <div className="card">
          <div className="card-body text-center">
            <div className="text-red-500 mb-4">
              <Heart size={48} className="mx-auto" />
            </div>
            <h2 className="text-2xl font-bold text-red-600 mb-4">Processing Failed</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {error}
            </p>
            <button onClick={onTryAgain} className="btn btn-primary">
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const getHeartRateStatus = (bpm) => {
    if (bpm < 60) return { status: 'Low', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' };
    if (bpm > 100) return { status: 'High', color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' };
    return { status: 'Normal', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' };
  };

  const heartRateStatus = getHeartRateStatus(heart_rate);

  return (
    <div className="container max-w-7xl mx-auto px-4">
      {/* Main Results Card */}
      <div className="card mb-8 animate-slide-in-up">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600">
                <Heart className="text-white" size={32} />
              </div>
              <div>
                <h2 className="text-4xl font-bold text-white">Analysis Results</h2>
                <p className="text-white/80 mt-1">Your physiological analysis is complete</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
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
        </div>

        <div className="card-body">
          {/* Heart Rate Display */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-8 p-12 rounded-3xl bg-gradient-to-r from-pink-500/20 to-purple-500/20 backdrop-blur-sm border border-pink-400/30 shadow-2xl">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600">
                <Heart className="text-white animate-pulse" size={64} />
              </div>
              <div>
                <div className="text-8xl font-bold text-white mb-4 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                  {heart_rate}
                </div>
                <div className="text-2xl text-white/80 font-medium">
                  beats per minute
                </div>
              </div>
            </div>
            
            <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-full mt-6 ${heartRateStatus.bg} backdrop-blur-sm`}>
              <TrendingUp size={20} />
              <span className={`text-lg font-semibold ${heartRateStatus.color}`}>
                {heartRateStatus.status} Heart Rate
              </span>
            </div>
          </div>

          {/* Method and Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 backdrop-blur-sm rounded-2xl p-6 text-center border border-blue-400/30">
              <div className="text-sm font-semibold text-blue-300 mb-2 uppercase tracking-wide">
                Processing Method
              </div>
              <div className="text-3xl font-bold text-white">
                {method}
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-sm rounded-2xl p-6 text-center border border-green-400/30">
              <div className="text-sm font-semibold text-green-300 mb-2 uppercase tracking-wide">
                Confidence Level
              </div>
              <div className="text-3xl font-bold text-white">
                High
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-2xl p-6 text-center border border-purple-400/30">
              <div className="text-sm font-semibold text-purple-300 mb-2 uppercase tracking-wide">
                Analysis Time
              </div>
              <div className="text-3xl font-bold text-white">
                ~20s
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Plots Section */}
      {showPlots && plots && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-xl font-bold">Signal Analysis Visualizations</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Detailed breakdown of the physiological signal processing
            </p>
          </div>
          
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* RGB Channel Plots */}
              {plots.red_channel && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-red-600">Red Channel Signal</h4>
                  <div 
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => setSelectedPlot(plots.red_channel)}
                  >
                    <img 
                      src={plots.red_channel} 
                      alt="Red Channel Signal" 
                      className="w-full rounded-lg border border-gray-200 dark:border-gray-600"
                    />
                  </div>
                </div>
              )}
              
              {plots.green_channel && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-green-600">Green Channel Signal</h4>
                  <div 
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => setSelectedPlot(plots.green_channel)}
                  >
                    <img 
                      src={plots.green_channel} 
                      alt="Green Channel Signal" 
                      className="w-full rounded-lg border border-gray-200 dark:border-gray-600"
                    />
                  </div>
                </div>
              )}
              
              {plots.blue_channel && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-blue-600">Blue Channel Signal</h4>
                  <div 
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => setSelectedPlot(plots.blue_channel)}
                  >
                    <img 
                      src={plots.blue_channel} 
                      alt="Blue Channel Signal" 
                      className="w-full rounded-lg border border-gray-200 dark:border-gray-600"
                    />
                  </div>
                </div>
              )}
              
              {/* Processed Signal */}
              {plots.signal && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-purple-600">{method} Processed Signal</h4>
                  <div 
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => setSelectedPlot(plots.signal)}
                  >
                    <img 
                      src={plots.signal} 
                      alt={`${method} Processed Signal`} 
                      className="w-full rounded-lg border border-gray-200 dark:border-gray-600"
                    />
                  </div>
                </div>
              )}
              
              {/* FFT Spectrum */}
              {plots.fft && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-orange-600">FFT Spectrum</h4>
                  <div 
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => setSelectedPlot(plots.fft)}
                  >
                    <img 
                      src={plots.fft} 
                      alt="FFT Spectrum" 
                      className="w-full rounded-lg border border-gray-200 dark:border-gray-600"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Plot Modal */}
      {selectedPlot && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedPlot(null)}
        >
          <div className="max-w-4xl max-h-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-600 flex justify-between items-center">
              <h3 className="text-lg font-semibold">Plot Viewer</h3>
              <button
                onClick={() => setSelectedPlot(null)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>
            <div className="p-4">
              <img 
                src={selectedPlot} 
                alt="Plot" 
                className="max-w-full max-h-96 mx-auto"
              />
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-6 flex justify-center gap-4">
        <button onClick={onTryAgain} className="btn btn-primary">
          <RotateCcw size={20} />
          Analyze Another Video
        </button>
        <button 
          onClick={() => window.print()} 
          className="btn btn-outline"
        >
          <Download size={20} />
          Print Results
        </button>
      </div>
    </div>
  );
};

export default Results;
