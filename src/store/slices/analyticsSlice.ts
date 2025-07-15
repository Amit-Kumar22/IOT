import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AnalyticsState {
  data: any;
  loading: boolean;
  error: string | null;
}

const initialState: AnalyticsState = {
  data: null,
  loading: false,
  error: null,
};

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    setAnalyticsData: (state, action: PayloadAction<any>) => {
      state.data = action.payload;
    },
    setAnalyticsLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setAnalyticsError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    clearAnalyticsError: (state) => {
      state.error = null;
    },
    updateAnalyticsMetrics: (state, action: PayloadAction<any>) => {
      if (state.data) {
        state.data.metrics = action.payload;
      }
    },
  },
});

export const {
  setAnalyticsData,
  setAnalyticsLoading,
  setAnalyticsError,
  clearAnalyticsError,
  updateAnalyticsMetrics,
} = analyticsSlice.actions;

export default analyticsSlice.reducer;
