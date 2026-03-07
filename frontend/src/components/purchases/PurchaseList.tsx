'use client';

import { useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchPurchases } from '@/store/purchaseSlice';
import PurchaseCard from './PurchaseCard';

export default function PurchaseList() {
  const dispatch = useAppDispatch();
  const { items, loading, error } = useAppSelector((s) => s.purchases);
  const userId = useAppSelector((s) => s.user.userId);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [countdown, setCountdown] = useState(5);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refresh = () => {
    dispatch(fetchPurchases(userId));
    setCountdown(5);
  };

  useEffect(() => {
    dispatch(fetchPurchases(userId));
  }, [userId, dispatch]);

  useEffect(() => {
    if (autoRefresh) {
      intervalRef.current = setInterval(() => {
        dispatch(fetchPurchases(userId));
        setCountdown(5);
      }, 5000);
      countdownRef.current = setInterval(() => {
        setCountdown((c) => (c > 0 ? c - 1 : 5));
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [autoRefresh, userId, dispatch]);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Purchases</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {userId} · {items.length} record{items.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Auto-refresh toggle */}
          <button
            onClick={() => setAutoRefresh((v) => !v)}
            className={`flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg border transition-colors ${
              autoRefresh
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : 'bg-gray-50 border-gray-200 text-gray-500'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-emerald-500 animate-pulse' : 'bg-gray-300'}`}
            />
            {autoRefresh ? `Auto-refresh (${countdown}s)` : 'Auto-refresh off'}
          </button>
          {/* Manual refresh */}
          <button
            onClick={refresh}
            disabled={loading}
            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors disabled:opacity-50"
            title="Refresh now"
          >
            <svg
              className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* SQS info banner */}
      <div className="mb-6 bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3 flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-indigo-600">
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"
            />
          </svg>
          <span>
            Purchases appear here after the <span className="font-semibold">Purchase Service</span>{' '}
            polls the <span className="font-mono font-semibold">order-created</span> SQS queue (~5s
            delay)
          </span>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 bg-rose-50 border border-rose-100 text-rose-700 text-sm px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {/* Content */}
      {loading && items.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <svg className="animate-spin w-8 h-8 text-indigo-400" fill="none" viewBox="0 0 24 24">
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
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <p className="text-gray-500 font-medium">No purchases yet</p>
          <p className="text-gray-400 text-sm mt-1">
            Go to Cart and checkout to trigger a purchase
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((purchase) => (
            <PurchaseCard key={purchase.id} purchase={purchase} />
          ))}
        </div>
      )}
    </div>
  );
}
