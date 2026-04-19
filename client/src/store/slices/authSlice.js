import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  role: null,
  isAuthenticated: false,
  loading: true,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthLoading: (state, action) => {
      state.loading = action.payload;
    },
    setAuthUser: (state, action) => {
      const user = action.payload;
      state.user = user;
      state.role = user?.role || null;
      state.isAuthenticated = Boolean(user);
      state.loading = false;
    },
    clearAuth: (state) => {
      state.user = null;
      state.role = null;
      state.isAuthenticated = false;
      state.loading = false;
    },
  },
});

export const { setAuthLoading, setAuthUser, clearAuth } = authSlice.actions;
export default authSlice.reducer;
