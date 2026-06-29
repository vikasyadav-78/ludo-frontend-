'use client';

import { useEffect, useCallback } from 'react';
import { useAppSelector } from '@/store/hooks';
import { connectSocket, disconnectSocket, getSocket } from '@/services/socket';

export function useSocket(battleId?: string) {
  const { token, isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated && token) {
      const socket = connectSocket(token);

      if (battleId) {
        socket.emit('join_battle', battleId);
      }

      return () => {
        if (battleId) {
          socket.emit('leave_battle', battleId);
        }
      };
    } else {
      disconnectSocket();
    }
  }, [isAuthenticated, token, battleId]);

  const emit = useCallback((event: string, data: any) => {
    const socket = getSocket();
    if (socket?.connected) {
      socket.emit(event, data);
    }
  }, []);

  const on = useCallback((event: string, callback: (data: any) => void) => {
    const socket = getSocket();
    if (socket) {
      socket.on(event, callback);
    }
    return () => {
      socket?.off(event, callback);
    };
  }, []);

  return { emit, on, socket: getSocket() };
}

export default useSocket;
