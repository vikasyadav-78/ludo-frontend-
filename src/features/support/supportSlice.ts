import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SupportTicket, SupportMessage } from '@/types';

interface SupportState {
  tickets: SupportTicket[];
  activeTicket: SupportTicket | null;
  activeMessages: SupportMessage[];
  loading: boolean;
  error: string | null;
}

const initialState: SupportState = {
  tickets: [],
  activeTicket: null,
  activeMessages: [],
  loading: false,
  error: null,
};

export const supportSlice = createSlice({
  name: 'support',
  initialState,
  reducers: {
    setTickets: (state, action: PayloadAction<SupportTicket[]>) => {
      state.tickets = action.payload;
    },
    addTicket: (state, action: PayloadAction<SupportTicket>) => {
      state.tickets.unshift(action.payload);
    },
    setActiveTicketDetails: (
      state,
      action: PayloadAction<{ ticket: SupportTicket; messages: SupportMessage[] }>
    ) => {
      state.activeTicket = action.payload.ticket;
      state.activeMessages = action.payload.messages;
    },
    addActiveMessage: (state, action: PayloadAction<SupportMessage>) => {
      state.activeMessages.push(action.payload);
    },
    updateTicketState: (state, action: PayloadAction<SupportTicket>) => {
      const idx = state.tickets.findIndex((t) => t.id === action.payload.id);
      if (idx !== -1) {
        state.tickets[idx] = action.payload;
      }
      if (state.activeTicket && state.activeTicket.id === action.payload.id) {
        state.activeTicket = action.payload;
      }
    },
    setSupportLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setSupportError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setTickets,
  addTicket,
  setActiveTicketDetails,
  addActiveMessage,
  updateTicketState,
  setSupportLoading,
  setSupportError,
} = supportSlice.actions;

export default supportSlice.reducer;
