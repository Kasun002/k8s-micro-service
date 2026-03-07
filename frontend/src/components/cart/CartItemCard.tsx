'use client';

import { useAppDispatch } from '@/store/hooks';
import { removeCartItem } from '@/store/cartSlice';
import { CartItem } from '@/types';

interface Props {
  item: CartItem;
}

export default function CartItemCard({ item }: Props) {
  const dispatch = useAppDispatch();

  return (
    <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-xl group hover:bg-indigo-50 transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-indigo-100 rounded-lg flex items-center justify-center shrink-0">
          <svg
            className="w-4 h-4 text-indigo-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">{item.product_id}</p>
          <p className="text-xs text-gray-500">
            {item.quantity} × ${Number(item.price).toFixed(2)}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold text-gray-900">
          ${(Number(item.price) * item.quantity).toFixed(2)}
        </span>
        <button
          onClick={() => dispatch(removeCartItem(item.id))}
          className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
          title="Remove item"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
