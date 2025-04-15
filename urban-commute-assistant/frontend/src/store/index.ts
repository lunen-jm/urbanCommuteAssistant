import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import transitDataReducer from './transitDataSlice';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { RootState } from '../types';

export const store = configureStore({
  reducer: {
    user: userReducer,
    transitData: transitDataReducer,
  },
});

export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;