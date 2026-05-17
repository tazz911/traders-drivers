import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../api/axiosConfig';

const initialState = {
    user: {},
    message: "",
    isLoading: false,
    isSuccess: false,
    isError: false
}

export const addUser = createAsyncThunk("user/addUser", async (userData, { rejectWithValue }) => {
    try {
        const response = await apiClient.post("/register", userData);
        return response.data.message;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Registration failed');
    }
});

export const login = createAsyncThunk("user/login", async (userData, { rejectWithValue }) => {
    try {
        const response = await apiClient.post("/login", userData);
        if (response.data.token) {
            localStorage.setItem('authToken', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
});

export const updateLocation = createAsyncThunk("user/updateLocation", async (locData, { rejectWithValue }) => {
    try {
        const response = await apiClient.put("/updateLocation", locData);
        return locData;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || 'Update failed');
    }
});

export const UserSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setLocation: (state, action) => {
            state.user.lat = action.payload.lat;
            state.user.lng = action.payload.lng;
        },
        setUser: (state, action) => {
            state.user = action.payload;
            state.isSuccess = true;
        },
        logout: (state) => {
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            state.user = {};
            state.message = "";
            state.isSuccess = false;
            state.isError = false;
        }
    },
    extraReducers: (builder) => {
        builder.addCase(addUser.pending, (state) => {
            state.isLoading = true;
        })
        .addCase(addUser.fulfilled, (state, action) => {
            state.isLoading = false;
            state.isSuccess = true;
            state.message = action.payload;
        })
        .addCase(addUser.rejected, (state, action) => {
            state.isLoading = false;
            state.isError = true;
            state.message = action.payload;
        })
        .addCase(login.pending, (state) => {
            state.isLoading = true;
        })
        .addCase(login.fulfilled, (state, action) => {
            state.isLoading = false;
            state.isSuccess = true;
            state.user = action.payload.user;
            state.message = action.payload.message;
        })
        .addCase(login.rejected, (state, action) => {
            state.isLoading = false;
            state.isError = true;
            state.message = action.payload;
        })
        .addCase(updateLocation.fulfilled, (state, action) => {
            if (state.user) {
                state.user.lat = action.payload.lat;
                state.user.lng = action.payload.lng;
            }
        });
    }
});

export const { setLocation, setUser, logout } = UserSlice.actions;
export default UserSlice.reducer;
