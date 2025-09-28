import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Bot, User, Heart, Brain, Lightbulb } from 'lucide-react';
import './css/SupportModal.css';

const SupportModal = ({ results, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!isInitialized && results) {
      // Initialize with CBT-based welcome message based on results
      const initialMessage = generateInitialMessage(results);
      setMessages([{
        id: Date.now(),
        type: 'bot',
        content: initialMessage,
        timestamp: new Date()
      }]);
      setIsInitialized(true);
    }
  }, [results, isInitialized]);

  const generateInitialMessage = (results) => {
    const { heart_rate } = results;
    let message = "Hello! I'm your mental health support assistant. I'm here to help you understand your physiological results and provide CBT-based guidance.\n\n";
    
    if (heart_rate < 60) {
      message += "I notice your heart rate is on the lower side. This could be normal for some people, but if you're feeling tired, sluggish, or experiencing any concerning symptoms, it's worth discussing with a healthcare provider.\n\n";
    } else if (heart_rate > 100) {
      message += "I see your heart rate is elevated. This could be due to various factors like stress, anxiety, physical activity, or other health conditions. Let's explore what might be contributing to this and discuss some coping strategies.\n\n";
    } else {
      message += "Your heart rate appears to be within a normal range, which is great! However, I'm here to support you with any concerns or questions you might have about your mental and physical well-being.\n\n";
    }
    
    message += "How are you feeling right now? What would you like to talk about?";
    return message;
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/gemini-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
          results: results,
          conversationHistory: messages
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from support assistant');
      }

      const data = await response.json();
      
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: data.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment, or consider reaching out to a healthcare professional if you need immediate support.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatMessage = (content) => {
    return content.split('\n').map((line, index) => (
      <span key={index}>
        {line}
        {index < content.split('\n').length - 1 && <br />}
      </span>
    ));
  };

  return (
    <div className="support-modal-overlay" onClick={onClose}>
      <div className="support-modal" onClick={(e) => e.stopPropagation()}>
        <div className="support-modal-header">
          <div className="header-left">
            <div className="bot-avatar">
              <Brain size={24} />
            </div>
            <div>
              <h3>Health Support</h3>
              <p>CBT-Based Guidance and Support</p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="support-modal-body">
          <div className="messages-container">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`message ${message.type}`}
              >
                <div className="message-avatar">
                  {message.type === 'bot' ? (
                    <Bot size={16} />
                  ) : (
                    <User size={16} />
                  )}
                </div>
                <div className="message-content">
                  <div className="message-text">
                    {formatMessage(message.content)}
                  </div>
                  <div className="message-time">
                    {message.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="message bot">
                <div className="message-avatar">
                  <Bot size={16} />
                </div>
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="support-modal-footer">
          <div className="input-container">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Share your thoughts, feelings, or concerns..."
              className="message-input"
              rows="1"
              disabled={isLoading}
            />
            <button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="send-btn"
            >
              <Send size={20} />
            </button>
          </div>
          <div className="support-info">
            <div className="info-item">
              <Heart size={16} />
              <span>Your heart rate: {results?.heart_rate} BPM</span>
            </div>
            <div className="info-item">
              <Lightbulb size={16} />
              <span>Remember: This is not a substitute for professional medical advice</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportModal;
