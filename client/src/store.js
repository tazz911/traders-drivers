import { configureStore } from "@reduxjs/toolkit";
import UserReducer from './features/UserSlice';
import OrderReducer from './features/OrderSlice';

export const store = configureStore({
    reducer: { user: UserReducer, order: OrderReducer }
});
