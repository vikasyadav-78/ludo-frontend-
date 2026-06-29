import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface WalletState {
  depositBalance: number;
  winningBalance: number;
  bonusBalance: number;
  totalBalance: number;
  loading: boolean;
}

const initialState: WalletState = {
  depositBalance: 0,
  winningBalance: 0,
  bonusBalance: 0,
  totalBalance: 0,
  loading: false,
};

export const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    updateBalances: (
      state,
      action: PayloadAction<{ depositBalance: number; winningBalance: number; bonusBalance: number }>
    ) => {
      state.depositBalance = action.payload.depositBalance;
      state.winningBalance = action.payload.winningBalance;
      state.bonusBalance = action.payload.bonusBalance;
      state.totalBalance =
        action.payload.depositBalance + action.payload.winningBalance + action.payload.bonusBalance;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { updateBalances, setLoading } = walletSlice.actions;
export default walletSlice.reducer;
