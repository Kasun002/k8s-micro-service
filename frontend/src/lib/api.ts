import { AddCartItemDto, CartItem, Product, Purchase, QueueStats } from '@/types';

const CART_BASE = '/api/cart';
const PURCHASES_BASE = '/api/purchases';
const PRODUCTS_BASE = '/api/products';

export const cartApi = {
  addItem: async (dto: AddCartItemDto): Promise<CartItem> => {
    const res = await fetch(CART_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    });
    if (!res.ok) throw new Error('Failed to add item');
    return res.json();
  },

  getCart: async (userId: string): Promise<CartItem[]> => {
    const res = await fetch(`${CART_BASE}/${userId}`);
    if (!res.ok) throw new Error('Failed to fetch cart');
    return res.json();
  },

  removeItem: async (id: string): Promise<void> => {
    const res = await fetch(`${CART_BASE}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to remove item');
  },

  checkout: async (userId: string): Promise<{ message: string }> => {
    const res = await fetch(`${CART_BASE}/checkout/${userId}`, { method: 'POST' });
    if (!res.ok) throw new Error('Checkout failed');
    return res.json();
  },
};

export const productsApi = {
  getAll: async (): Promise<Product[]> => {
    const res = await fetch(PRODUCTS_BASE);
    if (!res.ok) throw new Error('Failed to fetch products');
    return res.json();
  },
};

export const purchasesApi = {
  getByUser: async (userId: string): Promise<Purchase[]> => {
    const res = await fetch(`${PURCHASES_BASE}/user/${userId}`);
    if (!res.ok) throw new Error('Failed to fetch purchases');
    return res.json();
  },

  confirm: async (id: string): Promise<Purchase> => {
    const res = await fetch(`${PURCHASES_BASE}/${id}/confirm`, { method: 'PATCH' });
    if (!res.ok) throw new Error('Failed to confirm purchase');
    return res.json();
  },
};

export const adminApi = {
  getQueueStats: async (): Promise<QueueStats> => {
    const res = await fetch('/api/admin/queue');
    if (!res.ok) throw new Error('Failed to fetch queue stats');
    return res.json();
  },
};
