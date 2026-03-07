'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addCartItem, buyNow, clearCheckoutMessage, clearError } from '@/store/cartSlice';
import { productsApi } from '@/lib/api';
import { Product } from '@/types';

const CATEGORY_COLORS: Record<string, { bg: string; badge: string; icon: string }> = {
  Electronics: {
    bg: 'from-blue-400 to-indigo-600',
    badge: 'bg-blue-100 text-blue-700',
    icon: '💻',
  },
  Accessories: {
    bg: 'from-purple-400 to-violet-600',
    badge: 'bg-purple-100 text-purple-700',
    icon: '🖱️',
  },
  Audio: {
    bg: 'from-rose-400 to-pink-600',
    badge: 'bg-rose-100 text-rose-700',
    icon: '🎧',
  },
  Storage: {
    bg: 'from-emerald-400 to-teal-600',
    badge: 'bg-emerald-100 text-emerald-700',
    icon: '💾',
  },
};

const ALL = 'All';

export default function ProductsPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const userId = useAppSelector((s) => s.user.userId);
  const { loading, error, checkoutMessage } = useAppSelector((s) => s.cart);

  const [products, setProducts] = useState<Product[]>([]);
  const [fetching, setFetching] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [category, setCategory] = useState(ALL);
  const [addedId, setAddedId] = useState<string | null>(null);
  const [buyingId, setBuyingId] = useState<string | null>(null);

  useEffect(() => {
    productsApi
      .getAll()
      .then(setProducts)
      .catch(() => setFetchError('Could not load products. Is the Product Service running on :3003?'))
      .finally(() => setFetching(false));
  }, []);

  const categories = [ALL, ...Array.from(new Set(products.map((p) => p.category)))];

  const visible = category === ALL ? products : products.filter((p) => p.category === category);

  const handleAddToCart = async (product: Product) => {
    setAddedId(product.id);
    await dispatch(
      addCartItem({ userId, productId: product.sku, quantity: 1, price: Number(product.price) }),
    );
    setTimeout(() => setAddedId(null), 1500);
  };

  const handleBuyNow = async (product: Product) => {
    setBuyingId(product.id);
    await dispatch(
      buyNow({
        dto: { userId, productId: product.sku, quantity: 1, price: Number(product.price) },
        userId,
      }),
    );
    setBuyingId(null);
    router.push('/purchases');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <p className="text-sm text-gray-500 mt-1">
          Browse the catalog — add to cart or buy instantly with Cash on Delivery
        </p>
      </div>

      {/* Alerts */}
      {checkoutMessage && (
        <div className="mb-5 flex items-start gap-3 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm">
          <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="font-medium">{checkoutMessage}</p>
            <button
              onClick={() => { dispatch(clearCheckoutMessage()); router.push('/purchases'); }}
              className="text-emerald-600 underline text-xs mt-1 hover:text-emerald-800"
            >
              View Purchases →
            </button>
          </div>
          <button onClick={() => dispatch(clearCheckoutMessage())} className="ml-auto text-emerald-400 hover:text-emerald-600">✕</button>
        </div>
      )}

      {error && (
        <div className="mb-5 flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm">
          <span>{error}</span>
          <button onClick={() => dispatch(clearError())} className="ml-auto text-rose-400 hover:text-rose-600">✕</button>
        </div>
      )}

      {fetchError && (
        <div className="mb-5 bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-xl text-sm">
          {fetchError}
        </div>
      )}

      {/* Category tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              category === cat
                ? 'bg-indigo-600 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-indigo-300 hover:text-indigo-600'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      {fetching ? (
        <div className="flex items-center justify-center py-24">
          <svg className="animate-spin w-8 h-8 text-indigo-400" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {visible.map((product) => {
            const colors = CATEGORY_COLORS[product.category] ?? {
              bg: 'from-gray-400 to-gray-600',
              badge: 'bg-gray-100 text-gray-700',
              icon: '📦',
            };
            const isAdding = addedId === product.id;
            const isBuying = buyingId === product.id && loading;

            return (
              <div
                key={product.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-md transition-shadow"
              >
                {/* Thumbnail */}
                <div className={`bg-gradient-to-br ${colors.bg} h-36 flex items-center justify-center`}>
                  <span className="text-5xl">{colors.icon}</span>
                </div>

                {/* Info */}
                <div className="p-4 flex flex-col flex-1">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-gray-900 leading-snug">{product.name}</h3>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${colors.badge}`}>
                      {product.category}
                    </span>
                  </div>

                  <p className="text-xs text-gray-500 mb-3 line-clamp-2 flex-1">{product.description}</p>

                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-bold text-gray-900">${Number(product.price).toFixed(2)}</span>
                    <span
                      className={`text-xs font-medium ${
                        Number(product.stock) > 50
                          ? 'text-emerald-600'
                          : Number(product.stock) > 10
                          ? 'text-amber-600'
                          : 'text-rose-600'
                      }`}
                    >
                      {Number(product.stock) > 0 ? `${product.stock} in stock` : 'Out of stock'}
                    </span>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={isAdding || Number(product.stock) === 0}
                      className="flex-1 flex items-center justify-center gap-1 text-xs font-semibold py-2 rounded-lg border border-indigo-200 text-indigo-600 hover:bg-indigo-50 disabled:opacity-50 transition-colors"
                    >
                      {isAdding ? (
                        <>
                          <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Added!
                        </>
                      ) : (
                        <>
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          Add to Cart
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleBuyNow(product)}
                      disabled={isBuying || Number(product.stock) === 0}
                      className="flex-1 flex items-center justify-center gap-1 text-xs font-semibold py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                    >
                      {isBuying ? (
                        <>
                          <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Placing...
                        </>
                      ) : (
                        <>
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          Buy Now
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
