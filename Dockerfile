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

# Ferramentas de sistema necessárias:
#   - netcat-openbsd: usado pelo wait-for-db.sh para checar porta do MySQL
#   - wget: usado pelo HEALTHCHECK para verificar /api/health
RUN apk add --no-cache netcat-openbsd wget

# Instalar apenas dependências de produção
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod

# Copiar artefatos do build
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/client/dist ./client/dist
COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/shared ./shared

# Script de inicialização — aguarda o banco antes de subir o servidor
# Evita o loop de RESTARTING (Exit Code 1) por DATABASE_URL não disponível
COPY scripts/wait-for-db.sh ./scripts/wait-for-db.sh
RUN chmod +x ./scripts/wait-for-db.sh

# Variáveis de ambiente (sobrescritas em runtime via docker-compose ou DigitalOcean)
ENV NODE_ENV=production
ENV PORT=3000
ENV DB_HOST=db
ENV DB_PORT=3306

# Healthcheck — o container só é "Healthy" quando /api/health responde 200
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=5 \
  CMD wget -qO- http://localhost:3000/api/health || exit 1

USER operis
EXPOSE 3000

# Aguarda o banco de dados (wait-for-db.sh) e então inicia o servidor
CMD ["sh", "-c", "scripts/wait-for-db.sh node dist/index.js"]
