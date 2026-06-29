import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Battle {
  id: string;
  title: string;
  amount: number;
  commission: number;
  winnerAmount: number;
  inviteCode?: string;
  createdBy: { id: string; name: string; avatar?: string };
  joinedBy?: { id: string; name: string; avatar?: string };
  status:
    | 'OPEN'
    | 'JOINED'
    | 'IN_PROGRESS'
    | 'RESULT_SUBMITTED'
    | 'PENDING_APPROVAL'
    | 'COMPLETED'
    | 'DISPUTED'
    | 'CANCELLED';
  winner?: string;
  createdAt: string;
  updatedAt: string;
}

interface BattlesState {
  openBattles: Battle[];
  activeBattles: Battle[];
  completedBattles: Battle[];
  currentBattle: Battle | null;
  loading: boolean;
  error: string | null;
}

const initialState: BattlesState = {
  openBattles: [],
  activeBattles: [],
  completedBattles: [],
  currentBattle: null,
  loading: false,
  error: null,
};

export const battlesSlice = createSlice({
  name: 'battles',
  initialState,
  reducers: {
    setOpenBattles: (state, action: PayloadAction<Battle[]>) => {
      state.openBattles = action.payload.filter(
        (b, index, self) => self.findIndex((x) => x.id === b.id) === index
      );
    },
    setActiveBattles: (state, action: PayloadAction<Battle[]>) => {
      state.activeBattles = action.payload.filter(
        (b, index, self) => self.findIndex((x) => x.id === b.id) === index
      );
    },
    setCompletedBattles: (state, action: PayloadAction<Battle[]>) => {
      state.completedBattles = action.payload.filter(
        (b, index, self) => self.findIndex((x) => x.id === b.id) === index
      );
    },
    setCurrentBattle: (state, action: PayloadAction<Battle | null>) => {
      state.currentBattle = action.payload;
    },
    addOpenBattle: (state, action: PayloadAction<Battle>) => {
      const exists = state.openBattles.some((b) => b.id === action.payload.id);
      if (!exists) {
        state.openBattles.unshift(action.payload);
      }
    },
    updateBattleStatus: (state, action: PayloadAction<{ id: string; status: any }>) => {
      const { id, status } = action.payload;
      if (state.currentBattle && state.currentBattle.id === id) {
        state.currentBattle.status = status;
      }
      // Clean lists if moved to in_progress or completed
      state.openBattles = state.openBattles.map((b) => (b.id === id ? { ...b, status } : b));
      state.activeBattles = state.activeBattles.map((b) => (b.id === id ? { ...b, status } : b));
    },
    setBattlesLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setBattlesError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setOpenBattles,
  setActiveBattles,
  setCompletedBattles,
  setCurrentBattle,
  addOpenBattle,
  updateBattleStatus,
  setBattlesLoading,
  setBattlesError,
} = battlesSlice.actions;
export default battlesSlice.reducer;
