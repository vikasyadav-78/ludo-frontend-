import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { LeaderboardUser, ReferrerUser } from '@/types';

interface LeaderboardState {
  topWinners: LeaderboardUser[];
  topReferrers: ReferrerUser[];
  loading: boolean;
  error: string | null;
}

const initialState: LeaderboardState = {
  topWinners: [],
  topReferrers: [],
  loading: false,
  error: null,
};

export const leaderboardSlice = createSlice({
  name: 'leaderboard',
  initialState,
  reducers: {
    setLeaderboards: (
      state,
      action: PayloadAction<{ winners: LeaderboardUser[]; referrers: ReferrerUser[] }>
    ) => {
      state.topWinners = action.payload.winners;
      state.topReferrers = action.payload.referrers;
    },
    setLeaderboardLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setLeaderboardError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setLeaderboards, setLeaderboardLoading, setLeaderboardError } =
  leaderboardSlice.actions;

export default leaderboardSlice.reducer;
