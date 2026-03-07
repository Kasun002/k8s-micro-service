'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addCartItem } from '@/store/cartSlice';
import { productsApi } from '@/lib/api';
import { Product } from '@/types';

const CATEGORIES = ['All', 'Electronics', 'Accessories', 'Audio', 'Storage'];

const CATEGORY_COLORS: Record<string, string> = {
  Electronics: 'bg-blue-50 text-blue-700 border-blue-100',
  Accessories: 'bg-violet-50 text-violet-700 border-violet-100',
  Audio: 'bg-rose-50 text-rose-700 border-rose-100',
  Storage: 'bg-amber-50 text-amber-700 border-amber-100',
};

export default function AddItemForm() {
  const dispatch = useAppDispatch();
  const userId = useAppSelector((s) => s.user.userId);
  const cartLoading = useAppSelector((s) => s.cart.loading);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [addingId, setAddingId] = useState<string | null>(null);

  useEffect(() => {
    productsApi
      .getAll()
      .then(setProducts)
      .catch(() => setError('Could not load products. Is Product Service running on :3003?'))
      .finally(() => setLoading(false));
  }, []);

  const filtered =
    activeCategory === 'All' ? products : products.filter((p) => p.category === activeCategory);

  const handleAdd = async (product: Product) => {
    setAddingId(product.id);
    await dispatch(
      addCartItem({
        userId,
        productId: product.sku,
        quantity: 1,
        price: Number(product.price),
      }),
    );
    setAddingId(null);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-lg font-semibold text-gray-900">Products</h2>
        {!loading && !error && (
          <span className="text-xs text-gray-400">{products.length} items</span>
        )}
      </div>
      <p className="text-sm text-gray-500 mb-5">Select a product to add to your cart</p>

      {/* Category tabs */}
      {!error && (
        <div className="flex gap-1.5 flex-wrap mb-4">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                activeCategory === cat
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-indigo-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="flex items-start gap-2 bg-rose-50 border border-rose-100 text-rose-600 text-sm px-4 py-3 rounded-xl">
          <svg
            className="w-4 h-4 mt-0.5 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {error}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      )}

      {/* Product list */}
      {!loading && !error && (
        <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
          {filtered.map((product) => (
            <div
              key={product.id}
              className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/40 transition-colors group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="shrink-0">
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full border ${CATEGORY_COLORS[product.category] ?? 'bg-gray-50 text-gray-600 border-gray-100'}`}
                  >
                    {product.category}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                  <p className="text-xs text-gray-400 font-mono">{product.sku}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0 ml-3">
                <span className="text-sm font-semibold text-gray-900">
                  ${Number(product.price).toFixed(2)}
                </span>
                <button
                  onClick={() => handleAdd(product)}
                  disabled={cartLoading || addingId === product.id}
                  className="w-7 h-7 flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-lg transition-colors"
                  title={`Add ${product.name} to cart`}
                >
                  {addingId === product.id ? (
                    <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
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
                  ) : (
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
