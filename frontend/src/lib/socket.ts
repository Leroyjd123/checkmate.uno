import io, { Socket } from 'socket.io-client';
import { WS_BASE_URL, WS_RECONNECT_ATTEMPTS } from './constants';
import { getAuthToken } from './api';

let socket: Socket | null = null;

export function initializeSocket(): Socket {
  if (socket?.connected) {
    return socket;
  }

  const token = getAuthToken();

  socket = io(WS_BASE_URL, {
    auth: {
      token,
    },
    reconnection: true,
    reconnectionAttempts: WS_RECONNECT_ATTEMPTS,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    transports: ['websocket', 'polling'],
  });

  socket.on('connect', () => {
    console.log('WebSocket connected');
  });

  socket.on('disconnect', () => {
    console.log('WebSocket disconnected');
  });

  socket.on('connect_error', error => {
    console.error('WebSocket connection error:', error);
  });

  return socket;
}

export function getSocket(): Socket | null {
  return socket;
}

export function joinGameRoom(gameId: string): void {
  const ws = getSocket();
  if (!ws) {
    console.warn('Socket not initialized');
    return;
  }

  ws.emit('join_room', { game_id: gameId });
}

export function leaveGameRoom(gameId: string): void {
  const ws = getSocket();
  if (!ws) return;

  ws.emit('leave_room', { game_id: gameId });
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export type WebSocketEventHandler = (data: unknown) => void;

export function onWebSocketEvent(event: string, handler: WebSocketEventHandler): () => void {
  const ws = getSocket();
  if (!ws) {
    console.warn('Socket not initialized');
    return () => {};
  }

  ws.on(event, handler);

  // Return unsubscribe function
  return () => {
    ws.off(event, handler);
  };
}

export function emitWebSocketEvent(event: string, data: unknown): void {
  const ws = getSocket();
  if (!ws) {
    console.warn('Socket not initialized');
    return;
  }

  ws.emit(event, data);
}
