import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Referral, ReferralReward } from '@/types';

interface ReferralState {
  referrals: Referral[];
  rewards: ReferralReward[];
  loading: boolean;
  error: string | null;
}

const initialState: ReferralState = {
  referrals: [],
  rewards: [],
  loading: false,
  error: null,
};

export const referralSlice = createSlice({
  name: 'referrals',
  initialState,
  reducers: {
    setReferralData: (
      state,
      action: PayloadAction<{ referrals: Referral[]; rewards: ReferralReward[] }>
    ) => {
      state.referrals = action.payload.referrals;
      state.rewards = action.payload.rewards;
    },
    setReferralLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setReferralError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setReferralData, setReferralLoading, setReferralError } = referralSlice.actions;
export default referralSlice.reducer;
