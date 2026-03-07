/** @type {import('next').NextConfig} */
const CART_URL     = process.env.CART_SERVICE_URL     || 'http://localhost:3001';
const PURCHASE_URL = process.env.PURCHASE_SERVICE_URL || 'http://localhost:3002';
const PRODUCT_URL  = process.env.PRODUCT_SERVICE_URL  || 'http://localhost:3003';

const nextConfig = {
  output: 'standalone',

  async rewrites() {
    return [
      // Cart Service
      { source: '/api/cart',        destination: `${CART_URL}/cart` },
      { source: '/api/cart/:path*', destination: `${CART_URL}/cart/:path*` },

      // Purchase Service
      { source: '/api/purchases',           destination: `${PURCHASE_URL}/purchases` },
      { source: '/api/purchases/:path*',    destination: `${PURCHASE_URL}/purchases/:path*` },
      { source: '/api/purchases/:id/confirm', destination: `${PURCHASE_URL}/purchases/:id/confirm` },

      // Product Service
      { source: '/api/products',        destination: `${PRODUCT_URL}/products` },
      { source: '/api/products/:path*', destination: `${PRODUCT_URL}/products/:path*` },

      // Reports & Admin — purchase-service
      { source: '/api/reports/daily', destination: `${PURCHASE_URL}/reports/daily` },
      { source: '/api/admin/queue',   destination: `${PURCHASE_URL}/admin/queue` },
    ];
  },
};

export default nextConfig;
