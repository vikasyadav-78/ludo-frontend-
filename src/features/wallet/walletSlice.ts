import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface WalletState {
  depositBalance: number;
  winningBalance: number;
  bonusBalance: number;
  lifetimeBonus: number;
  totalBalance: number;
  loading: boolean;
  error: string | null;
}

const initialState: WalletState = {
  depositBalance: 0,
  winningBalance: 0,
  bonusBalance: 0,
  lifetimeBonus: 0,
  totalBalance: 0,
  loading: false,
  error: null,
};

export const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    setWalletBalances: (
      state,
      action: PayloadAction<{ depositBalance: number; winningBalance: number; bonusBalance: number; lifetimeBonus: number; totalBalance: number }>
    ) => {
      state.depositBalance = action.payload.depositBalance;
      state.winningBalance = action.payload.winningBalance;
      state.bonusBalance = action.payload.bonusBalance;
      state.lifetimeBonus = action.payload.lifetimeBonus;
      state.totalBalance = action.payload.totalBalance;
    },
    setWalletLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setWalletError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setWalletBalances, setWalletLoading, setWalletError } = walletSlice.actions;
export default walletSlice.reducer;
