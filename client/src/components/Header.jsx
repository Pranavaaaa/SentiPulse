import React from 'react';
import { Heart, Moon, Sun, Home, ArrowLeft } from 'lucide-react';

const Header = ({ isDarkMode, onToggleDarkMode, onReset, currentView }) => {
  const canGoBack = currentView !== 'home';
  
  return (
    <header className="glass sticky top-0 z-50 border-b border-white/10">
      <div className="container">
        <div className="flex items-center justify-between py-6">
          <div className="flex items-center gap-4">
            {canGoBack && (
              <button
                onClick={onReset}
                className="p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-300 backdrop-blur-sm"
                title="Back to Home"
              >
                <ArrowLeft size={20} className="text-white" />
              </button>
            )}
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600">
                <Heart className="text-white" size={24} />
              </div>
              <h1 className="text-2xl font-bold text-white">Physiological Monitor</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
              <span className="text-sm font-medium text-white">
                {currentView === 'home' && 'Home'}
                {currentView === 'upload' && 'Upload Video'}
                {currentView === 'processing' && 'Processing'}
                {currentView === 'results' && 'Results'}
                {currentView === 'error' && 'Error'}
              </span>
            </div>
            
            <button
              onClick={onToggleDarkMode}
              className="p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-300 backdrop-blur-sm"
              title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
            >
              {isDarkMode ? <Sun size={20} className="text-white" /> : <Moon size={20} className="text-white" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
