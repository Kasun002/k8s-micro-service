# ── Stage 1: Install dependencies ────────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json ./
RUN npm install

# ── Stage 2: Build ────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# Rewrites in next.config.mjs are evaluated at build time.
# Default to K8s DNS names so the baked image routes correctly inside the cluster.
ARG CART_SERVICE_URL=http://cart-service:3001
ARG PURCHASE_SERVICE_URL=http://purchase-service:3002
ARG PRODUCT_SERVICE_URL=http://product-service:3003
ENV CART_SERVICE_URL=$CART_SERVICE_URL
ENV PURCHASE_SERVICE_URL=$PURCHASE_SERVICE_URL
ENV PRODUCT_SERVICE_URL=$PRODUCT_SERVICE_URL

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN mkdir -p public && npm run build

# ── Stage 3: Production runner ────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3004

RUN addgroup --system --gid 1001 nodejs && \
    adduser  --system --uid 1001 nextjs

# standalone output bundles server.js + required node_modules
COPY --from=builder /app/public ./public
RUN mkdir .next && chown nextjs:nodejs .next
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static    ./.next/static

USER nextjs

EXPOSE 3004

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget -qO- http://localhost:3004/ || exit 1

CMD ["node", "server.js"]
