'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { initializeSocket, disconnectSocket, onWebSocketEvent, joinGameRoom } from '@/lib/socket';

interface WebSocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  subscribe: (event: string, handler: (data: unknown) => void) => () => void;
  joinRoom: (gameId: string) => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Initialize socket on mount
  useEffect(() => {
    const ws = initializeSocket();

    const handleConnect = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
    };

    const handleDisconnect = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    };

    ws.on('connect', handleConnect);
    ws.on('disconnect', handleDisconnect);

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSocket(ws);

    // Cleanup on unmount
    return () => {
      ws.off('connect', handleConnect);
      ws.off('disconnect', handleDisconnect);
      disconnectSocket();
    };
  }, []);

  const subscribe = useCallback(
    (event: string, handler: (data: unknown) => void): (() => void) => {
      return onWebSocketEvent(event, handler);
    },
    []
  );

  const joinRoom = useCallback((gameId: string) => {
    joinGameRoom(gameId);
  }, []);

  const value: WebSocketContextType = {
    socket,
    isConnected,
    subscribe,
    joinRoom,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket(): WebSocketContextType {
  const context = useContext(WebSocketContext);

  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }

  return context;
}
