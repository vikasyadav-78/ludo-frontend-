import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import walletReducer from './slices/walletSlice';
import battleReducer from './slices/battleSlice';
import { api } from './services/api';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    wallet: walletReducer,
    battle: battleReducer,
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
