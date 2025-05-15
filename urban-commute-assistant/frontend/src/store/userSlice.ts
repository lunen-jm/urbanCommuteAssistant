import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserState } from '../types';

const initialState: UserState = {
  id: null,
  name: '',
  email: '',
  preferences: {
    darkMode: false,
    preferredTransportModes: [],
    notificationSettings: {
      email: false,
      push: false,
      sms: false
    }
  }
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<Partial<UserState>>) {
      return { ...state, ...action.payload };
    },
    clearUser() {
      return initialState;
    },
    updatePreferences(state, action: PayloadAction<Partial<UserState['preferences']>>) {
      state.preferences = { ...state.preferences, ...action.payload };
    },
  },
});

export const { setUser, clearUser, updatePreferences } = userSlice.actions;
export default userSlice.reducer;