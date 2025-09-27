import React from 'react';
import { Play, Heart, Brain, Activity, Video } from 'lucide-react';

const Hero = ({ onStartProcessing }) => {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-pink-600/20 to-blue-600/20"></div>
      <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      
      <div className="container relative z-10">
        <div className="text-center py-20">
          <div className="mb-12 animate-fade-in">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 mb-8 shadow-2xl">
              <Heart className="text-white" size={48} />
            </div>
            <h1 className="text-6xl font-bold mb-8 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent animate-slide-in-up">
              Physiological Monitoring System
            </h1>
            <p className="text-xl text-white/90 mb-12 max-w-4xl mx-auto leading-relaxed animate-slide-in-up">
              Advanced contactless heart rate estimation using computer vision and signal processing. 
              Upload a video to analyze physiological signals in real-time with cutting-edge AI technology.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 animate-slide-in-up">
            <div className="card p-8 text-center hover:scale-105 transition-transform duration-300">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 mb-6 mx-auto">
                <Video className="text-white" size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">Video Analysis</h3>
              <p className="text-white/80 leading-relaxed">
                Upload video files for contactless physiological monitoring with advanced computer vision
              </p>
            </div>

            <div className="card p-8 text-center hover:scale-105 transition-transform duration-300">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 mb-6 mx-auto">
                <Brain className="text-white" size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">AI Processing</h3>
              <p className="text-white/80 leading-relaxed">
                Advanced ICA/PCA algorithms for signal extraction and analysis with machine learning
              </p>
            </div>

            <div className="card p-8 text-center hover:scale-105 transition-transform duration-300">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 mb-6 mx-auto">
                <Activity className="text-white" size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">Real-time Results</h3>
              <p className="text-white/80 leading-relaxed">
                Get instant heart rate estimates with detailed visualizations and analytics
              </p>
            </div>
          </div>

          <div className="animate-slide-in-up">
            <button
              onClick={onStartProcessing}
              className="btn btn-primary btn-lg animate-bounce"
            >
              <Play size={28} />
              Start Analysis
            </button>
          </div>

          <div className="mt-12 text-sm text-white/70 animate-fade-in">
            <div className="flex items-center justify-center gap-8 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400"></div>
                <span>Supported: MP4, AVI, MOV, WebM</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                <span>Maximum file size: 100MB</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                <span>Processing time: ~20 seconds</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
