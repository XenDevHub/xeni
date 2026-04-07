import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from './auth';

export type SocketEvent =
  | 'new_message'
  | 'message_replied'
  | 'order_created'
  | 'order_updated'
  | 'stock_alert'
  | 'task_completed'
  | 'escalation_needed'
  | 'subscription_updated'
  | 'admin.activity';

interface SocketState {
  socket: Socket | null;
  isConnected: boolean;
  lastEvent: { event: SocketEvent; payload: unknown; timestamp: number } | null;
  connect: () => void;
  disconnect: () => void;
  on: (event: SocketEvent, handler: (payload: unknown) => void) => void;
  off: (event: SocketEvent, handler: (payload: unknown) => void) => void;
}

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080/ws';

export const useSocketStore = create<SocketState>()((set, get) => ({
  socket: null,
  isConnected: false,
  lastEvent: null,

  connect: () => {
    const existing = get().socket;
    if (existing?.connected) return;

    const { accessToken } = useAuthStore.getState();
    if (!accessToken) return;

    const socket = io(WS_URL, {
      auth: { token: accessToken },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });

    socket.on('connect', () => {
      set({ isConnected: true });
    });

    socket.on('disconnect', () => {
      set({ isConnected: false });
    });

    // Generic event listener for last event tracking
    const trackedEvents: SocketEvent[] = [
      'new_message',
      'message_replied',
      'order_created',
      'order_updated',
      'stock_alert',
      'task_completed',
      'escalation_needed',
      'subscription_updated',
      'admin.activity',
    ];

    trackedEvents.forEach((event) => {
      socket.on(event, (payload: unknown) => {
        set({ lastEvent: { event, payload, timestamp: Date.now() } });
      });
    });

    set({ socket });
  },

  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null, isConnected: false });
    }
  },

  on: (event, handler) => {
    const { socket } = get();
    socket?.on(event, handler);
  },

  off: (event, handler) => {
    const { socket } = get();
    socket?.off(event, handler);
  },
}));
