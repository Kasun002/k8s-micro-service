'use client';

import { useState } from 'react';
import { Purchase } from '@/types';
import { useAppDispatch } from '@/store/hooks';
import { confirmPurchase } from '@/store/purchaseSlice';

interface Props {
  purchase: Purchase;
}

export default function PurchaseCard({ purchase }: Props) {
  const dispatch = useAppDispatch();
  const [confirming, setConfirming] = useState(false);

  const statusColors = {
    pending: 'bg-amber-100 text-amber-700 border-amber-200',
    confirmed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  };

  const color = statusColors[purchase.status as keyof typeof statusColors] ?? 'bg-gray-100 text-gray-600 border-gray-200';

  const handleConfirm = async () => {
    setConfirming(true);
    await dispatch(confirmPurchase(purchase.id));
    setConfirming(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs text-gray-400 font-mono mb-1">{purchase.id.slice(0, 8)}...</p>
          <p className="text-xl font-bold text-gray-900">${Number(purchase.total).toFixed(2)}</p>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border capitalize ${color}`}>
          {purchase.status}
        </span>
      </div>

      {/* Items */}
      <div className="space-y-1.5 mb-4 flex-1">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Items</p>
        {purchase.items.map((item, i) => (
          <div
            key={i}
            className="flex items-center justify-between text-sm bg-gray-50 rounded-lg px-3 py-1.5"
          >
            <span className="text-gray-700 font-medium">{item.productId}</span>
            <span className="text-gray-500">
              {item.quantity} × ${Number(item.price).toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-gray-100">
        <div className="flex items-center gap-1.5 mb-3">
          <svg className="w-3.5 h-3.5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-xs text-gray-400">
            {new Date(purchase.created_at).toLocaleString()}
          </span>
        </div>

        {purchase.status === 'pending' && (
          <button
            onClick={handleConfirm}
            disabled={confirming}
            className="w-full flex items-center justify-center gap-2 text-xs font-semibold py-2.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60 transition-colors"
          >
            {confirming ? (
              <>
                <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Confirming...
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Complete — Cash on Delivery
              </>
            )}
          </button>
        )}

        {purchase.status === 'confirmed' && (
          <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-600 font-medium py-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Payment confirmed
          </div>
        )}
      </div>
    </div>
  );
}
