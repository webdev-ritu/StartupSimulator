import { useState, useEffect, useRef } from "react";

interface WebSocketOptions {
  path: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export function useWebSocket({ 
  path, 
  reconnectInterval = 3000, 
  maxReconnectAttempts = 5 
}: WebSocketOptions) {
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<number | null>(null);
  
  useEffect(() => {
    const connect = () => {
      try {
        // Close existing socket if present
        if (socketRef.current) {
          socketRef.current.close();
        }
        
        // Create new WebSocket connection
        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const wsUrl = `${protocol}//${window.location.host}${path}`;
        
        const socket = new WebSocket(wsUrl);
        socketRef.current = socket;
        
        socket.onopen = () => {
          setConnected(true);
          setError(null);
          reconnectAttemptsRef.current = 0;
        };
        
        socket.onclose = (event) => {
          setConnected(false);
          
          // Only try to reconnect if not a clean close
          if (!event.wasClean) {
            attemptReconnect();
          }
        };
        
        socket.onerror = (event) => {
          setError("WebSocket connection error");
          setConnected(false);
        };
      } catch (err) {
        setError("Failed to create WebSocket connection");
        setConnected(false);
        attemptReconnect();
      }
    };
    
    const attemptReconnect = () => {
      // Clear any existing timeout
      if (reconnectTimeoutRef.current) {
        window.clearTimeout(reconnectTimeoutRef.current);
      }
      
      if (reconnectAttemptsRef.current < maxReconnectAttempts) {
        reconnectAttemptsRef.current += 1;
        setError(`Connection lost. Reconnecting... (${reconnectAttemptsRef.current}/${maxReconnectAttempts})`);
        
        reconnectTimeoutRef.current = window.setTimeout(() => {
          connect();
        }, reconnectInterval);
      } else {
        setError("Failed to connect after multiple attempts. Please refresh the page.");
      }
    };
    
    // Initial connection
    connect();
    
    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
      
      if (reconnectTimeoutRef.current) {
        window.clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [path, reconnectInterval, maxReconnectAttempts]);
  
  // Return the socket and connection state
  return {
    socket: socketRef.current,
    connected,
    error
  };
}
