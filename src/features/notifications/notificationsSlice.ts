import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  type: 'BATTLE' | 'WALLET' | 'SYSTEM';
  readStatus: boolean;
  createdAt: string;
}

interface NotificationsState {
  notifications: AppNotification[];
  loading: boolean;
  error: string | null;
}

const initialState: NotificationsState = {
  notifications: [],
  loading: false,
  error: null,
};

export const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setNotifications: (state, action: PayloadAction<AppNotification[]>) => {
      state.notifications = action.payload.filter(
        (n, index, self) => self.findIndex((x) => x.id === n.id) === index
      );
    },
    addNotification: (state, action: PayloadAction<AppNotification>) => {
      const exists = state.notifications.some((n) => n.id === action.payload.id);
      if (!exists) {
        state.notifications.unshift(action.payload);
      }
    },
    markRead: (state, action: PayloadAction<string>) => {
      const index = state.notifications.findIndex((n) => n.id === action.payload);
      if (index !== -1) {
        state.notifications[index].readStatus = true;
      }
    },
    markAllRead: (state) => {
      state.notifications = state.notifications.map((n) => ({ ...n, readStatus: true }));
    },
    setNotificationsLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setNotificationsError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setNotifications,
  addNotification,
  markRead,
  markAllRead,
  setNotificationsLoading,
  setNotificationsError,
} = notificationsSlice.actions;
export default notificationsSlice.reducer;
