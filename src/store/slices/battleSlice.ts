import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Battle {
  id: string;
  title: string;
  amount: number;
  commission: number;
  winnerAmount: number;
  inviteCode?: string;
  createdBy: string;
  joinedBy?: string;
  status:
    | 'OPEN'
    | 'JOINED'
    | 'IN_PROGRESS'
    | 'RESULT_SUBMITTED'
    | 'PENDING_APPROVAL'
    | 'COMPLETED'
    | 'DISPUTED'
    | 'CANCELLED';
}

interface BattleState {
  battles: Battle[];
  currentBattle: Battle | null;
  loading: boolean;
}

const initialState: BattleState = {
  battles: [],
  currentBattle: null,
  loading: false,
};

export const battleSlice = createSlice({
  name: 'battle',
  initialState,
  reducers: {
    setBattles: (state, action: PayloadAction<Battle[]>) => {
      state.battles = action.payload;
    },
    setCurrentBattle: (state, action: PayloadAction<Battle | null>) => {
      state.currentBattle = action.payload;
    },
    addBattle: (state, action: PayloadAction<Battle>) => {
      state.battles.unshift(action.payload);
    },
    updateBattleInList: (state, action: PayloadAction<Battle>) => {
      const index = state.battles.findIndex((b) => b.id === action.payload.id);
      if (index !== -1) {
        state.battles[index] = action.payload;
      }
      if (state.currentBattle && state.currentBattle.id === action.payload.id) {
        state.currentBattle = action.payload;
      }
    },
  },
});

export const { setBattles, setCurrentBattle, addBattle, updateBattleInList } = battleSlice.actions;
export default battleSlice.reducer;
