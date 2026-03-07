'use client';

import { Purchase } from '@/types';

interface Props {
  purchase: Purchase;
}

export default function PurchaseCard({ purchase }: Props) {
  const statusColors = {
    pending: 'bg-amber-100 text-amber-700 border-amber-200',
    confirmed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  };

  const color = statusColors[purchase.status] ?? 'bg-gray-100 text-gray-600 border-gray-200';

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs text-gray-400 font-mono mb-1">{purchase.id.slice(0, 8)}...</p>
          <p className="text-xl font-bold text-gray-900">${Number(purchase.total).toFixed(2)}</p>
        </div>
        <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-full border capitalize ${color}`}
        >
          {purchase.status}
        </span>
      </div>

      {/* Items */}
      <div className="space-y-1.5 mb-4">
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
      <div className="flex items-center gap-1.5 pt-3 border-t border-gray-100">
        <svg
          className="w-3.5 h-3.5 text-gray-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span className="text-xs text-gray-400">
          {new Date(purchase.created_at).toLocaleString()}
        </span>
      </div>
    </div>
  );
}
