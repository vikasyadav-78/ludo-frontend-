import { io, Socket } from 'socket.io-client';
import { store } from '@/store/store';
import { addNotification } from '@/features/notifications/notificationsSlice';
import { updateRoomBattleStatus } from '@/features/battles/battleRoomSlice';
import { setSettings } from '@/features/settings/settingsSlice';
import { env } from '@/config/env';

let socket: Socket | null = null;
const SOCKET_URL = env.SOCKET_URL;

export const connectSocket = (token: string): Socket => {
  if (socket?.connected) return socket;

  if (socket) {
    try {
      socket.disconnect();
    } catch (e) {
      // Ignore
    }
  }

  socket = io(SOCKET_URL, {
    auth: { token },
    query: { token },
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 2000,
  });

  socket.on('connect', () => {
    console.log('🔌 Socket connected successfully:', socket?.id);
  });

  socket.on('disconnect', (reason) => {
    console.warn('🔌 Socket disconnected:', reason);
  });

  socket.on('connect_error', (error) => {
    console.warn('🔌 Socket connection error:', error.message);
  });

  // Listen for real-time notifications globally
  socket.on('notification', (data: any) => {
    store.dispatch(addNotification(data));
  });

  // Listen for battle list changes globally
  socket.on('battle_list_update', (data: any) => {
    // Logic to dispatch battle updates locally
    if (data.event === 'battle_joined' || data.event === 'battle_completed') {
      store.dispatch(updateRoomBattleStatus(data.data.status));
    }
  });

  // Listen for real-time setting changes from admin
  socket.on('settings_update', (data: any) => {
    console.log('📢 System settings updated in real-time:', data);
    store.dispatch(setSettings(data || {}));
  });

  return socket;
};

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log('🔌 Socket disconnected manually.');
  }
};

export const getSocket = (): Socket | null => {
  return socket;
};
