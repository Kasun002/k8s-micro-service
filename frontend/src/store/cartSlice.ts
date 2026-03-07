import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { CartItem, AddCartItemDto } from '@/types';
import { cartApi } from '@/lib/api';

interface CartState {
  items: CartItem[];
  loading: boolean;
  error: string | null;
  checkoutMessage: string | null;
}

const initialState: CartState = {
  items: [],
  loading: false,
  error: null,
  checkoutMessage: null,
};

export const fetchCart = createAsyncThunk('cart/fetchCart', async (userId: string) => {
  return cartApi.getCart(userId);
});

export const addCartItem = createAsyncThunk('cart/addItem', async (dto: AddCartItemDto) => {
  return cartApi.addItem(dto);
});

export const removeCartItem = createAsyncThunk('cart/removeItem', async (id: string) => {
  await cartApi.removeItem(id);
  return id;
});

export const checkout = createAsyncThunk('cart/checkout', async (userId: string) => {
  return cartApi.checkout(userId);
});

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearCheckoutMessage: (state) => {
      state.checkoutMessage = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Failed to fetch cart';
      })

      .addCase(addCartItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addCartItem.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push(action.payload);
      })
      .addCase(addCartItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Failed to add item';
      })

      .addCase(removeCartItem.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
      })

      .addCase(checkout.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkout.fulfilled, (state) => {
        state.loading = false;
        state.items = [];
        state.checkoutMessage = 'Checkout initiated! Purchase will appear in ~5 seconds.';
      })
      .addCase(checkout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Checkout failed';
      });
  },
});

export const { clearCheckoutMessage, clearError } = cartSlice.actions;
export default cartSlice.reducer;
