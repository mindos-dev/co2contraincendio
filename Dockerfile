# ─── Stage 1: Dependencies ───────────────────────────────────────────────────
FROM node:22-alpine AS deps
WORKDIR /app

# Instalar pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copiar manifests de dependências
COPY package.json pnpm-lock.yaml ./
COPY client/package.json ./client/

# Instalar dependências de produção + dev (necessário para build)
RUN pnpm install --frozen-lockfile

# ─── Stage 2: Build ───────────────────────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/client/node_modules ./client/node_modules
COPY . .

# Build do frontend (Vite) e do backend (TypeScript)
RUN pnpm run build

# ─── Stage 3: Production ─────────────────────────────────────────────────────
FROM node:22-alpine AS production
WORKDIR /app

# Usuário não-root para segurança
RUN addgroup -g 1001 -S nodejs && adduser -S operis -u 1001

# Instalar apenas dependências de produção
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod

# Copiar artefatos do build
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/client/dist ./client/dist
COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/shared ./shared

# Variáveis de ambiente (sobrescritas em runtime via ECS/EC2)
ENV NODE_ENV=production
ENV PORT=3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/health || exit 1

USER operis
EXPOSE 3000

CMD ["node", "dist/index.js"]
