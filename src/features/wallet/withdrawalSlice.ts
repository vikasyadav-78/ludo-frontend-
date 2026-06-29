import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { WithdrawalRequest } from '@/types';

interface WithdrawalState {
  withdrawals: WithdrawalRequest[];
  loading: boolean;
  error: string | null;
}

const initialState: WithdrawalState = {
  withdrawals: [],
  loading: false,
  error: null,
};

export const withdrawalSlice = createSlice({
  name: 'withdrawal',
  initialState,
  reducers: {
    setWithdrawals: (state, action: PayloadAction<WithdrawalRequest[]>) => {
      state.withdrawals = action.payload;
    },
    addWithdrawal: (state, action: PayloadAction<WithdrawalRequest>) => {
      state.withdrawals.unshift(action.payload);
    },
    updateWithdrawalStatus: (
      state,
      action: PayloadAction<{ id: string; status: WithdrawalRequest['status'] }>
    ) => {
      const index = state.withdrawals.findIndex((w) => w.id === action.payload.id);
      if (index !== -1) {
        state.withdrawals[index].status = action.payload.status;
      }
    },
    setWithdrawalLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setWithdrawalError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setWithdrawals,
  addWithdrawal,
  updateWithdrawalStatus,
  setWithdrawalLoading,
  setWithdrawalError,
} = withdrawalSlice.actions;

export default withdrawalSlice.reducer;
