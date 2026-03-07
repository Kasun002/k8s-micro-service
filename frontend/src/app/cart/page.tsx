'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchCart } from '@/store/cartSlice';
import CartList from '@/components/cart/CartList';

export default function CartPage() {
  const dispatch = useAppDispatch();
  const userId = useAppSelector((s) => s.user.userId);

  useEffect(() => {
    if (userId) dispatch(fetchCart(userId));
  }, [userId, dispatch]);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
        <p className="text-sm text-gray-500 mt-1">
          Review your items and place your order
        </p>
      </div>
      <CartList />
    </div>
  );
}
