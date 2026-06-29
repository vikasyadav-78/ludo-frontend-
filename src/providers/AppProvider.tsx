'use client';

import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { Toaster } from 'react-hot-toast';
import { store, persistor } from '@/store/store';
import ErrorBoundary from '@/components/ErrorBoundary';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setSettings, setSettingsLoading, setSettingsError } from '@/features/settings/settingsSlice';
import settingsService from '@/services/settings.service';
import { connectSocket, disconnectSocket } from '@/services/socket';

interface AppProviderProps {
  children: React.ReactNode;
}

function AppShell({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const { token, isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        dispatch(setSettingsLoading(true));
        const publicSettings = await settingsService.getPublicSettings();
        dispatch(setSettings(publicSettings));
      } catch (error: any) {
        dispatch(setSettingsError(error.message || 'Failed to load settings'));
      } finally {
        dispatch(setSettingsLoading(false));
      }
    };

    loadSettings();
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated && token) {
      connectSocket(token);
      return () => {
        disconnectSocket();
      };
    }

    disconnectSocket();
  }, [isAuthenticated, token]);

  return (
    <>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#121624',
            color: '#F3F4F6',
            border: '1px solid rgba(255, 255, 255, 0.05)',
          },
        }}
      />
    </>
  );
}

export default function AppProvider({ children }: AppProviderProps) {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <AppShell>{children}</AppShell>
        </PersistGate>
      </Provider>
    </ErrorBoundary>
  );
}
