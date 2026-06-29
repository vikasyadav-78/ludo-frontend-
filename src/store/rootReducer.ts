import { combineReducers } from '@reduxjs/toolkit';
import authReducer from '@/features/auth/authSlice';
import walletReducer from '@/features/wallet/walletSlice';
import battlesReducer from '@/features/battles/battlesSlice';
import battleRoomReducer from '@/features/battles/battleRoomSlice';
import battleResultReducer from '@/features/battles/battleResultSlice';
import notificationsReducer from '@/features/notifications/notificationsSlice';
import withdrawalReducer from '@/features/wallet/withdrawalSlice';
import supportReducer from '@/features/support/supportSlice';
import referralReducer from '@/features/referrals/referralSlice';
import leaderboardReducer from '@/features/leaderboard/leaderboardSlice';
import settingsReducer from '@/features/settings/settingsSlice';

export const rootReducer = combineReducers({
  auth: authReducer,
  wallet: walletReducer,
  battles: battlesReducer,
  battleRoom: battleRoomReducer,
  battleResult: battleResultReducer,
  notifications: notificationsReducer,
  withdrawal: withdrawalReducer,
  support: supportReducer,
  referrals: referralReducer,
  leaderboard: leaderboardReducer,
  settings: settingsReducer,
});

export default rootReducer;
