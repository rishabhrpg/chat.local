import { io, type Socket } from 'socket.io-client';
import type { SocketMessageData } from '../types';

// Get Socket.IO URL based on environment
const getSocketUrl = (): string => {
  const env = import.meta.env.VITE_ENV || 'production';
  const serverPort = import.meta.env.VITE_SERVER_PORT || '80';
  
  if (env === 'development') {
    return `${window.location.protocol}//${window.location.hostname}:${serverPort}`;
  }
  
  // When served by Express, use the same domain
  return `${window.location.protocol}//${window.location.hostname}:${window.location.port}`;
};

type EventHandler = (...args: unknown[]) => void;

class SocketService {
  private socket: Socket | null = null;
  private eventHandlers: Map<string, EventHandler[]> = new Map();

  connect(token: string): void {
    if (this.socket) {
      this.disconnect();
    }

    this.socket = io(getSocketUrl());

    // Authenticate with socket
    this.socket.emit('authenticate', { token });

    // Set up reconnection handlers
    this.socket.on('connect', () => {
      console.log('Socket connected');
      if (token) {
        this.socket?.emit('authenticate', { token });
      }
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    // Forward events to registered handlers
    this.setupEventForwarding();
  }

  private setupEventForwarding(): void {
    if (!this.socket) return;

    const events = [
      'authenticated',
      'auth_error',
      'receive_message',
      'user_joined',
      'user_left',
      'user_typing',
      'user_stop_typing',
    ];

    events.forEach((event) => {
      this.socket?.on(event, (...args: unknown[]) => {
        const handlers = this.eventHandlers.get(event);
        if (handlers) {
          handlers.forEach((handler) => handler(...args));
        }
      });
    });
  }

  on(event: string, handler: EventHandler): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)?.push(handler);
  }

  off(event: string, handler?: EventHandler): void {
    if (!handler) {
      this.eventHandlers.delete(event);
      return;
    }

    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  emit(event: string, data?: unknown): void {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }

  sendMessage(messageData: SocketMessageData): void {
    this.emit('send_message', messageData);
  }

  typing(username: string): void {
    this.emit('typing', { username });
  }

  stopTyping(username: string): void {
    this.emit('stop_typing', { username });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.eventHandlers.clear();
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

const socketService = new SocketService();
export default socketService;

