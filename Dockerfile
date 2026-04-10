# ═══════════════════════════════════════════════════════════════════════════════
# OPERIS Command Center — Dockerfile Multi-Stage
# Projeto: CO₂ Contra Incêndio SaaS | D.G.O. — Dashboard de Governança
# Responsável: Aleixo (Technical Manager) | JULY AOG — Project Diamond
#
# ESTRUTURA REAL DO REPOSITÓRIO (monorepo flat):
#   /package.json        ← único package.json (raiz)
#   /pnpm-lock.yaml      ← lockfile pnpm na raiz
#   /client/             ← frontend (sem package.json próprio)
#   /server/             ← backend tRPC
#   /drizzle/            ← migrations e schema
#   /shared/             ← tipos compartilhados
#
# Build: vite build (frontend → dist/public) + esbuild (backend → dist/index.js)
# Start: node dist/index.js
# ═══════════════════════════════════════════════════════════════════════════════

# ─── Stage 1: Dependencies ───────────────────────────────────────────────────
# Instala TODAS as dependências (dev + prod) necessárias para o build
FROM node:20-alpine AS deps
WORKDIR /app

# Instalar pnpm via corepack (versão compatível com pnpm-lock.yaml)
RUN corepack enable && corepack prepare pnpm@10.4.1 --activate

# ATENÇÃO: Apenas package.json e pnpm-lock.yaml na RAIZ.
# NÃO existe client/package.json neste repositório.
COPY package.json pnpm-lock.yaml ./

# Instalar todas as dependências (dev incluídas para o build)
RUN pnpm install --frozen-lockfile

# ─── Stage 2: Builder ────────────────────────────────────────────────────────
# Compila o frontend (Vite → dist/public) e o backend (esbuild → dist/index.js)
FROM node:20-alpine AS builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.4.1 --activate

# Copiar node_modules do stage anterior
COPY --from=deps /app/node_modules ./node_modules

# Copiar TODO o código-fonte (client/, server/, shared/, drizzle/, configs)
COPY . .

# Executar o build completo:
# 1. vite build     → compila client/src → dist/public
# 2. esbuild        → compila server/_core/index.ts → dist/index.js
RUN pnpm run build

# ─── Stage 3: Production Runner ──────────────────────────────────────────────
# Imagem enxuta de produção — apenas o necessário para rodar
FROM node:20-alpine AS production
WORKDIR /app

# Ferramentas de sistema necessárias:
#   netcat-openbsd → wait-for-db.sh (verifica porta 3306 do MySQL)
#   wget           → HEALTHCHECK (GET /api/health)
RUN apk add --no-cache netcat-openbsd wget

# Usuário não-root para segurança (sem privilégios de root em produção)
RUN addgroup -g 1001 -S nodejs && adduser -S operis -u 1001

# Instalar apenas dependências de PRODUÇÃO (sem devDependencies)
RUN corepack enable && corepack prepare pnpm@10.4.1 --activate
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod

# Copiar artefatos do build (frontend compilado + backend compilado)
COPY --from=builder /app/dist ./dist

# Copiar migrations do Drizzle (necessárias para db:push em runtime)
COPY --from=builder /app/drizzle ./drizzle

# Copiar shared (tipos compartilhados que podem ser importados em runtime)
COPY --from=builder /app/shared ./shared

# Script de inicialização — aguarda MySQL antes de subir o servidor
# Evita o loop de RESTARTING (Exit Code 1) por DATABASE_URL não disponível
COPY scripts/wait-for-db.sh ./scripts/wait-for-db.sh
RUN chmod +x ./scripts/wait-for-db.sh

# Variáveis de ambiente padrão (sobrescritas pelo docker-compose ou DigitalOcean)
ENV NODE_ENV=production
ENV PORT=3000
ENV DB_HOST=db
ENV DB_PORT=3306

# Healthcheck — o container só é marcado como "Healthy" quando /api/health responde 200
# start-period=90s: tempo para o MySQL subir + migrações rodarem
HEALTHCHECK --interval=30s --timeout=10s --start-period=90s --retries=5 \
  CMD wget -qO- http://localhost:${PORT}/api/health || exit 1

# Rodar como usuário não-root
USER operis

EXPOSE 3000

# Entrypoint: aguarda o banco (wait-for-db.sh) e então inicia o servidor Node.js
CMD ["sh", "-c", "scripts/wait-for-db.sh node dist/index.js"]
