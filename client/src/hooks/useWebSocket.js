import { useState, useEffect, useRef } from 'react';

const useWebSocket = (url) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectDelay = 3000; // 3 seconds

  useEffect(() => {
    let ws = null;

    const connect = () => {
      try {
        ws = new WebSocket(url);

        ws.onopen = () => {
          console.log('WebSocket connected to', url);
          setIsConnected(true);
          setError(null);
          reconnectAttempts.current = 0;
          setSocket(ws);
        };

        ws.onclose = (event) => {
          console.log('WebSocket disconnected:', event.code, event.reason);
          setIsConnected(false);
          setSocket(null);

          // Attempt to reconnect if not a clean close and we haven't exceeded max attempts
          if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
            reconnectAttempts.current += 1;
            console.log(`Attempting to reconnect... (${reconnectAttempts.current}/${maxReconnectAttempts})`);
            
            reconnectTimeoutRef.current = setTimeout(() => {
              connect();
            }, reconnectDelay * reconnectAttempts.current);
          } else if (reconnectAttempts.current >= maxReconnectAttempts) {
            setError('Failed to reconnect after multiple attempts');
          }
        };

        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          setError('WebSocket connection error');
        };

        ws.onmessage = (event) => {
          // Message handling is done in the component that uses this hook
          console.log('WebSocket message received:', event.data);
        };

      } catch (err) {
        console.error('Failed to create WebSocket connection:', err);
        setError('Failed to create WebSocket connection');
      }
    };

    connect();

    // Cleanup function
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (ws) {
        ws.close(1000, 'Component unmounting');
      }
    };
  }, [url]);

  const sendMessage = (message) => {
    if (socket && isConnected) {
      try {
        socket.send(JSON.stringify(message));
        return true;
      } catch (err) {
        console.error('Failed to send WebSocket message:', err);
        setError('Failed to send message');
        return false;
      }
    }
    return false;
  };

  const disconnect = () => {
    if (socket) {
      socket.close(1000, 'Manual disconnect');
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
  };

  return {
    socket,
    isConnected,
    error,
    sendMessage,
    disconnect,
  };
};

export default useWebSocket;
