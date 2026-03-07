'use client';

import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { checkout, clearCheckoutMessage, clearError } from '@/store/cartSlice';
import CartItemCard from './CartItemCard';
import { useEffect } from 'react';

export default function CartList() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { items, loading, error, checkoutMessage } = useAppSelector((s) => s.cart);
  const userId = useAppSelector((s) => s.user.userId);

  const total = items.reduce((sum, i) => sum + Number(i.price) * i.quantity, 0);

  useEffect(() => {
    if (checkoutMessage) {
      const t = setTimeout(() => dispatch(clearCheckoutMessage()), 8000);
      return () => clearTimeout(t);
    }
  }, [checkoutMessage, dispatch]);

  const handleCheckout = () => {
    dispatch(checkout(userId));
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col h-full">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Your Cart</h2>
          <p className="text-sm text-gray-500">
            {userId} · {items.length} item{items.length !== 1 ? 's' : ''}
          </p>
        </div>
        {items.length > 0 && (
          <span className="text-xs bg-indigo-100 text-indigo-700 font-medium px-2.5 py-1 rounded-full">
            {items.length} items
          </span>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 flex items-center gap-2 bg-rose-50 border border-rose-100 text-rose-700 text-sm px-4 py-3 rounded-xl">
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {error}
          <button
            onClick={() => dispatch(clearError())}
            className="ml-auto text-rose-400 hover:text-rose-600"
          >
            ✕
          </button>
        </div>
      )}

      {/* Checkout success */}
      {checkoutMessage && (
        <div className="mb-4 bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm px-4 py-3 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="font-medium">{checkoutMessage}</span>
          </div>
          <button
            onClick={() => {
              dispatch(clearCheckoutMessage());
              router.push('/purchases');
            }}
            className="text-emerald-600 underline text-xs font-medium hover:text-emerald-800"
          >
            View Purchases →
          </button>
        </div>
      )}

      {/* SQS flow info */}
      <div className="mb-5 bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3">
        <div className="flex items-center gap-2 text-xs text-indigo-600 font-medium mb-1">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Message Flow
        </div>
        <p className="text-xs text-indigo-500">
          Cart Service <span className="font-mono">:3001</span> → SQS{' '}
          <span className="font-mono">order-created</span> → Purchase Service{' '}
          <span className="font-mono">:3002</span>
        </p>
      </div>

      {/* Items */}
      <div className="flex-1 space-y-2 overflow-y-auto">
        {loading && items.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <svg className="animate-spin w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <svg
              className="w-12 h-12 mb-3 text-gray-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <p className="text-sm font-medium text-gray-400">Cart is empty</p>
            <p className="text-xs text-gray-300 mt-1">Add items using the form</p>
          </div>
        ) : (
          items.map((item) => <CartItemCard key={item.id} item={item} />)
        )}
      </div>

      {/* Footer */}
      {items.length > 0 && (
        <div className="mt-5 pt-5 border-t border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-600">Total</span>
            <span className="text-xl font-bold text-gray-900">${total.toFixed(2)}</span>
          </div>
          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Sending to SQS...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Checkout → Send to SQS
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
