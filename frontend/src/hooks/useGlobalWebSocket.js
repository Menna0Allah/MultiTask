import { useEffect, useRef, useState } from 'react';

export const useGlobalWebSocket = (userId, onMessage) => {
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef(null);

  useEffect(() => {
    if (!userId) return;

    const token = localStorage.getItem('access_token');
    const wsUrl = `${import.meta.env.VITE_WS_URL}/notifications/?token=${token}`;

    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('Global WebSocket connected');
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (onMessage) {
          onMessage(data);
        }
      } catch (error) {
        console.error('Global WebSocket message error:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('Global WebSocket error:', error);
      setIsConnected(false);
    };

    ws.onclose = () => {
      console.log('Global WebSocket disconnected');
      setIsConnected(false);
    };

    wsRef.current = ws;

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [userId]);

  const sendMessage = (message) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  };

  return { isConnected, sendMessage };
};
