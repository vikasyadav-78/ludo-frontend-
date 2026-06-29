import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SettingsState {
  values: Record<string, string>;
  loading: boolean;
  error: string | null;
}

const initialState: SettingsState = {
  values: {},
  loading: false,
  error: null,
};

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setSettings: (state, action: PayloadAction<Record<string, string>>) => {
      state.values = action.payload;
    },
    updateSettings: (state, action: PayloadAction<Record<string, string>>) => {
      state.values = { ...state.values, ...action.payload };
    },
    setSettingsLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setSettingsError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setSettings, updateSettings, setSettingsLoading, setSettingsError } = settingsSlice.actions;
export default settingsSlice.reducer;
