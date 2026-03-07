export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  price: number;
  created_at: string;
}

export interface PurchaseItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface Purchase {
  id: string;
  user_id: string;
  items: PurchaseItem[];
  total: number;
  status: 'pending' | 'confirmed';
  created_at: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  is_active: boolean;
  created_at: string;
}

export interface AddCartItemDto {
  userId: string;
  productId: string;
  quantity: number;
  price: number;
}

export interface QueueStats {
  queue: {
    name: string;
    url: string;
    messagesAvailable: number;
    messagesInFlight: number;
    messagesDelayed: number;
  };
  purchases: {
    total: number;
    pending: number;
    confirmed: number;
  };
}
