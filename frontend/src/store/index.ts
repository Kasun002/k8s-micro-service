import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './cartSlice';
import purchaseReducer from './purchaseSlice';
import userReducer from './userSlice';

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    purchases: purchaseReducer,
    user: userReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
