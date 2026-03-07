/**
 * lint-staged configuration
 *
 * NestJS services: ESLint runs on staged files using root node_modules.
 * Each service's .eslintrc.js (root:true) is resolved automatically.
 *
 * Frontend: next lint is called via yarn since it manages its own
 * eslint-config-next and Next.js-specific rules.
 */
export default {
  // NestJS services — lint staged TS files via root ESLint binary
  'cart-service/src/**/*.ts': 'eslint --fix',
  'purchase-service/src/**/*.ts': 'eslint --fix',
  'product-service/src/**/*.ts': 'eslint --fix',

  // Frontend — delegate to Next.js lint (handles its own config)
  'frontend/src/**/*.{ts,tsx}': () => 'yarn --cwd frontend next lint',

  // Formatting across all services
  '**/*.{json,md,yml,yaml}': 'prettier --write',
};
