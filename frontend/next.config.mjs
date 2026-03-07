/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      // Cart Service — :3001
      { source: '/api/cart', destination: 'http://localhost:3001/cart' },
      { source: '/api/cart/:path*', destination: 'http://localhost:3001/cart/:path*' },

      // Purchase Service — :3002
      { source: '/api/purchases', destination: 'http://localhost:3002/purchases' },
      { source: '/api/purchases/:path*', destination: 'http://localhost:3002/purchases/:path*' },

      // Product Service — :3003
      { source: '/api/products', destination: 'http://localhost:3003/products' },
      { source: '/api/products/:path*', destination: 'http://localhost:3003/products/:path*' },

      // Purchase confirm
      { source: '/api/purchases/:id/confirm', destination: 'http://localhost:3002/purchases/:id/confirm' },

      // Reports — purchase-service :3002
      { source: '/api/reports/daily', destination: 'http://localhost:3002/reports/daily' },

      // Admin — purchase-service :3002
      { source: '/api/admin/queue', destination: 'http://localhost:3002/admin/queue' },
    ];
  },
};

export default nextConfig;
