'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setUserId } from '@/store/userSlice';
import { fetchCart } from '@/store/cartSlice';
import { fetchPurchases } from '@/store/purchaseSlice';

export default function Navbar() {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const userId = useAppSelector((s) => s.user.userId);
  const cartCount = useAppSelector((s) => s.cart.items.length);

  const handleUserChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setUserId(e.target.value));
  };

  const handleUserBlur = () => {
    if (userId.trim()) {
      dispatch(fetchCart(userId));
      dispatch(fetchPurchases(userId));
    }
  };

  const isProducts = pathname === '/';
  const isCart = pathname === '/cart';
  const isPurchases = pathname === '/purchases';
  const isAdmin = pathname === '/admin';

  return (
    <nav className="bg-indigo-700 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="bg-white/20 rounded-lg p-1.5">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <span className="text-white font-bold text-lg tracking-tight">MQ Demo</span>
          </div>

          {/* Nav links */}
          <div className="flex items-center gap-1">
            <Link
              href="/"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isProducts ? 'bg-white text-indigo-700' : 'text-indigo-100 hover:bg-indigo-600'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                />
              </svg>
              Products
            </Link>

            <Link
              href="/cart"
              className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isCart ? 'bg-white text-indigo-700' : 'text-indigo-100 hover:bg-indigo-600'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              Cart
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </Link>

            <Link
              href="/purchases"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isPurchases ? 'bg-white text-indigo-700' : 'text-indigo-100 hover:bg-indigo-600'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              Purchases
            </Link>

            <Link
              href="/admin"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isAdmin ? 'bg-white text-indigo-700' : 'text-indigo-100 hover:bg-indigo-600'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              Queue Monitor
            </Link>
          </div>

          {/* User ID */}
          <div className="flex items-center gap-2">
            <label className="text-indigo-200 text-sm font-medium">User ID:</label>
            <input
              type="text"
              value={userId}
              onChange={handleUserChange}
              onBlur={handleUserBlur}
              className="bg-indigo-600 border border-indigo-400 text-white placeholder-indigo-300 rounded-lg px-3 py-1.5 text-sm w-28 focus:outline-none focus:ring-2 focus:ring-white/50"
              placeholder="user1"
            />
          </div>
        </div>
      </div>
    </nav>
  );
}
