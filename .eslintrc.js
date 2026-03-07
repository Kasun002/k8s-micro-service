module.exports = {
  root: true,
  // Root config applies only to root-level files.
  // Each service has its own .eslintrc.js with root:true which takes precedence.
  ignorePatterns: [
    '**/node_modules/**',
    '**/dist/**',
    '**/.next/**',
    'cart-service/**',
    'purchase-service/**',
    'product-service/**',
    'frontend/**',
  ],
};
