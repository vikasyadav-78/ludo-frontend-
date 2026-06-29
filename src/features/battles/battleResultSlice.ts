import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { BattleResult } from '@/types';

interface BattleResultState {
  results: BattleResult[];
  loading: boolean;
  error: string | null;
}

const initialState: BattleResultState = {
  results: [],
  loading: false,
  error: null,
};

export const battleResultSlice = createSlice({
  name: 'battleResult',
  initialState,
  reducers: {
    setBattleResults: (state, action: PayloadAction<BattleResult[]>) => {
      state.results = action.payload;
    },
    addBattleResult: (state, action: PayloadAction<BattleResult>) => {
      state.results.push(action.payload);
    },
    setResultLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setResultError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setBattleResults, addBattleResult, setResultLoading, setResultError } =
  battleResultSlice.actions;

export default battleResultSlice.reducer;
