import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
    orders: [],
    availableOrders: [],
    message: "",
    status: "idle",
    isLoading: false,
    isSuccess: false,
    isError: false
}

export const getOrders = createAsyncThunk("order/getOrders", async ({ email, status } = {}) => {
    try {
        let url = "http://localhost:3002/getOrders";
        const params = [];
        if (email)  params.push(`email=${email}`);
        if (status) params.push(`status=${status}`);
        if (params.length) url += "?" + params.join("&");
        const response = await axios.get(url);
        return response.data.orders;
    } catch (error) {
        console.log("Server Error.." + error);
    }
});

export const getAvailableOrders = createAsyncThunk("order/getAvailableOrders", async () => {
    try {
        const response = await axios.get("http://localhost:3002/getAvailableOrders");
        return response.data.orders;
    } catch (error) {
        console.log("Server Error.." + error);
    }
});

export const saveOrder = createAsyncThunk("order/saveOrder", async (orderData) => {
    try {
        const response = await axios.post("http://localhost:3002/saveOrder", orderData);
        return response.data.message;
    } catch (error) {
        console.log("Server Error.." + error);
    }
});

export const updOrder = createAsyncThunk("order/updOrder", async (odata) => {
    try {
        const response = await axios.put("http://localhost:3002/updOrder", odata);
        return response.data.message;
    } catch (error) {
        console.log("Server Error.." + error);
    }
});

export const delOrder = createAsyncThunk("order/delOrder", async (orderid) => {
    try {
        const response = await axios.delete(`http://localhost:3002/delOrder/${orderid}`);
        return response.data.message;
    } catch (error) {
        console.log("Server Error.." + error);
    }
});

export const acceptOrder = createAsyncThunk("order/acceptOrder", async (odata) => {
    try {
        const response = await axios.put("http://localhost:3002/acceptOrder", odata);
        return response.data.message;
    } catch (error) {
        console.log("Server Error.." + error);
    }
});

export const completeOrder = createAsyncThunk("order/completeOrder", async (odata) => {
    try {
        const response = await axios.put("http://localhost:3002/completeOrder", odata);
        return response.data.message;
    } catch (error) {
        console.log("Server Error.." + error);
    }
});

export const cancelOrder = createAsyncThunk("order/cancelOrder", async (odata) => {
    try {
        const response = await axios.put("http://localhost:3002/cancelOrder", odata);
        return response.data.message;
    } catch (error) {
        console.log("Server Error.." + error);
    }
});

export const payOrder = createAsyncThunk("order/payOrder", async (odata) => {
    try {
        const response = await axios.put("http://localhost:3002/payOrder", odata);
        return response.data.message;
    } catch (error) {
        console.log("Server Error.." + error);
    }
});

export const OrderSlice = createSlice({
    name: "order",
    initialState,
    extraReducers: (builder) => {
        builder
        .addCase(getOrders.pending, (state) => { state.isLoading = true; state.status = "loading"; })
        .addCase(getOrders.fulfilled, (state, action) => { state.isLoading = false; state.isSuccess = true; state.status = "loaded"; state.orders = action.payload || []; })
        .addCase(getOrders.rejected, (state) => { state.isLoading = false; state.isError = true; state.status = "rejected"; })

        .addCase(getAvailableOrders.fulfilled, (state, action) => { state.availableOrders = action.payload || []; })

        .addCase(saveOrder.pending, (state) => { state.isLoading = true; state.status = "pending"; })
        .addCase(saveOrder.fulfilled, (state, action) => { state.isLoading = false; state.isSuccess = true; state.status = "saved"; state.message = action.payload; })
        .addCase(saveOrder.rejected, (state) => { state.isLoading = false; state.isError = true; state.status = "rejected"; })

        .addCase(delOrder.fulfilled, (state, action) => { state.status = "deleted"; state.message = action.payload; })
        .addCase(updOrder.fulfilled, (state, action) => { state.status = "updated"; state.message = action.payload; })
        .addCase(acceptOrder.fulfilled, (state, action) => { state.status = "accepted"; state.message = action.payload; })
        .addCase(completeOrder.fulfilled, (state, action) => { state.status = "completed"; state.message = action.payload; })
        .addCase(cancelOrder.fulfilled, (state, action) => { state.status = "cancelled"; state.message = action.payload; })
        .addCase(payOrder.fulfilled, (state, action) => { state.status = "paid"; state.message = action.payload; });
    }
});

export default OrderSlice.reducer;
