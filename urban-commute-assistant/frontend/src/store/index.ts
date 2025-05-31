import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import transitDataReducer from './transitDataSlice';
import authReducer from './authSlice';
import mapReducer from './mapSlice';
import weatherReducer from './weatherSlice';
import trafficReducer from './trafficSlice';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { RootState } from '../types';

export const store = configureStore({
  reducer: {
    user: userReducer,
    transitData: transitDataReducer,
    auth: authReducer,
    map: mapReducer,
    weather: weatherReducer,
    traffic: trafficReducer,
  },
});

export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Export RootState directly
export type { RootState };