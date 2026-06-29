import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Battle, BattleParticipant } from '@/types';

interface BattleRoomState {
  battle: Battle | null;
  participants: BattleParticipant[];
  loading: boolean;
  error: string | null;
}

const initialState: BattleRoomState = {
  battle: null,
  participants: [],
  loading: false,
  error: null,
};

export const battleRoomSlice = createSlice({
  name: 'battleRoom',
  initialState,
  reducers: {
    setBattleRoom: (
      state,
      action: PayloadAction<{ battle: Battle; participants: BattleParticipant[] }>
    ) => {
      state.battle = action.payload.battle;
      state.participants = action.payload.participants;
    },
    updateRoomBattleStatus: (state, action: PayloadAction<Battle['status']>) => {
      if (state.battle) {
        state.battle.status = action.payload;
      }
    },
    updateParticipantState: (state, action: PayloadAction<BattleParticipant>) => {
      const index = state.participants.findIndex((p) => p.id === action.payload.id);
      if (index !== -1) {
        state.participants[index] = action.payload;
      } else {
        state.participants.push(action.payload);
      }
    },
    clearBattleRoom: (state) => {
      state.battle = null;
      state.participants = [];
      state.error = null;
    },
    setBattleRoomLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setBattleRoomError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setBattleRoom,
  updateRoomBattleStatus,
  updateParticipantState,
  clearBattleRoom,
  setBattleRoomLoading,
  setBattleRoomError,
} = battleRoomSlice.actions;

export default battleRoomSlice.reducer;
