import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import weatherReducer from './weatherSlice';
import trafficReducer from './trafficSlice';
import transitReducer from './transitSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    weather: weatherReducer,
    traffic: trafficReducer,
    transit: transitReducer,
  },
});

export default store;
