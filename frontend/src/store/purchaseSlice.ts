import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Purchase } from '@/types';
import { purchasesApi } from '@/lib/api';

interface PurchaseState {
  items: Purchase[];
  loading: boolean;
  error: string | null;
}

const initialState: PurchaseState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchPurchases = createAsyncThunk('purchases/fetchByUser', async (userId: string) => {
  return purchasesApi.getByUser(userId);
});

export const confirmPurchase = createAsyncThunk('purchases/confirm', async (id: string) => {
  return purchasesApi.confirm(id);
});

const purchaseSlice = createSlice({
  name: 'purchases',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPurchases.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPurchases.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchPurchases.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Failed to fetch purchases';
      })

      .addCase(confirmPurchase.fulfilled, (state, action) => {
        const idx = state.items.findIndex((p) => p.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      });
  },
});

export const { clearError } = purchaseSlice.actions;
export default purchaseSlice.reducer;
