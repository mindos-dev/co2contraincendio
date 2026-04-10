# ═══════════════════════════════════════════════════════════════════════════════
# OPERIS Command Center — Dockerfile Multi-Stage (Modelo Modular Diamond)
# Projeto: CO₂ Contra Incêndio SaaS | D.G.O. — Dashboard de Governança
# Responsável: Aleixo (Technical Manager) | JULY AOG — Project Diamond
#
# ESTRUTURA REAL DO REPOSITÓRIO (monorepo flat):
#   /package.json        ← único package.json (raiz)
#   /pnpm-lock.yaml      ← lockfile pnpm na raiz
#   /client/             ← frontend React 19 (sem package.json próprio)
#   /server/             ← backend tRPC + D.G.O.
#   /drizzle/            ← schema e migrations (54 tabelas)
#   /shared/             ← tipos compartilhados
#   /scripts/            ← wait-for-db.sh (Boot Orchestrator)
#
# PILARES DE FERRO:
#   1. git instalado → Git Import do GitHub no boot
#   2. npx disponível → drizzle-kit push automático
#   3. Fallback resiliente → serve /dist sem vite se necessário
#   4. ERR_MODULE_NOT_FOUND (vite) é INACEITÁVEL → prevenido no stage production
#
# Build: pnpm run build (vite + esbuild → dist/)
# Start: scripts/wait-for-db.sh node dist/index.js
# ═══════════════════════════════════════════════════════════════════════════════

# ─── Stage 1: Dependencies ───────────────────────────────────────────────────
# Instala TODAS as dependências (dev + prod) necessárias para o build
FROM node:20-alpine AS deps
WORKDIR /app

# Instalar pnpm via corepack
RUN corepack enable && corepack prepare pnpm@10.4.1 --activate

# ATENÇÃO: Apenas package.json e pnpm-lock.yaml na RAIZ.
# NÃO existe client/package.json neste repositório (monorepo flat).
COPY package.json pnpm-lock.yaml ./

# Instalar TODAS as dependências (dev incluídas — necessárias para o build)
RUN pnpm install --frozen-lockfile

# ─── Stage 2: Builder ────────────────────────────────────────────────────────
# Compila o frontend (Vite → dist/public) e o backend (esbuild → dist/index.js)
FROM node:20-alpine AS builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.4.1 --activate

# Copiar node_modules do stage anterior (inclui vite, esbuild, etc.)
COPY --from=deps /app/node_modules ./node_modules

# Copiar TODO o código-fonte
COPY . .

# Executar o build completo:
#   pnpm run build → vite build (client → dist/public) + esbuild (server → dist/index.js)
RUN pnpm run build

# Verificar que o build foi bem-sucedido
RUN ls -la dist/ && echo "✅ Build concluído com sucesso"

# ─── Stage 3: Production Runner ──────────────────────────────────────────────
# Imagem enxuta de produção — apenas o necessário para rodar
FROM node:20-alpine AS production
WORKDIR /app

# ── Ferramentas de sistema necessárias ──────────────────────────────────────
#   netcat-openbsd → wait-for-db.sh: verifica porta 3306 do MySQL
#   wget           → HEALTHCHECK: GET /api/health
#   git            → Git Import: clona/atualiza repositório OPERIS no boot
#   curl           → fallback para healthcheck e requisições HTTP
RUN apk add --no-cache \
    netcat-openbsd \
    wget \
    git \
    curl \
    ca-certificates

# ── Instalar dependências de PRODUÇÃO ────────────────────────────────────────
# Inclui drizzle-kit como devDependency acessível via npx
RUN corepack enable && corepack prepare pnpm@10.4.1 --activate

COPY package.json pnpm-lock.yaml ./

# Instalar TODAS as dependências (incluindo devDependencies para npx drizzle-kit)
# Em produção, drizzle-kit é necessário para o db:push no boot
RUN pnpm install --frozen-lockfile

# ── Copiar artefatos do build ─────────────────────────────────────────────────
# Frontend compilado (dist/public) + Backend compilado (dist/index.js)
COPY --from=builder /app/dist ./dist

# Schema e config do Drizzle (necessários para drizzle-kit push no boot)
COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/drizzle.config.ts ./drizzle.config.ts

# Tipos compartilhados
COPY --from=builder /app/shared ./shared

# ── Boot Orchestrator (Modelo Modular Diamond) ────────────────────────────────
# Sequência: MySQL → Git Import → drizzle-kit push → node dist/index.js
COPY scripts/wait-for-db.sh ./scripts/wait-for-db.sh
RUN chmod +x ./scripts/wait-for-db.sh

# ── Variáveis de ambiente padrão ──────────────────────────────────────────────
ENV NODE_ENV=production
ENV PORT=3000
ENV DB_HOST=db
ENV DB_PORT=3306

# ── Healthcheck ───────────────────────────────────────────────────────────────
# O container só é marcado como "Healthy" quando /api/health responde 200
# start-period=120s: MySQL + Git Import + drizzle-kit push podem demorar
HEALTHCHECK --interval=30s --timeout=10s --start-period=120s --retries=5 \
  CMD wget -qO- http://localhost:${PORT}/api/health || exit 1

EXPOSE 3000

# ── Entrypoint: Boot Orchestrator → Servidor Node.js ─────────────────────────
# O wait-for-db.sh executa os 4 Pilares de Ferro antes de iniciar o servidor
# FALLBACK: se node dist/index.js falhar por ERR_MODULE_NOT_FOUND,
#           o servidor usa o dist/public como fallback estático
CMD ["sh", "-c", "scripts/wait-for-db.sh node dist/index.js || (echo '⚠️ Fallback: servindo dist/public' && npx serve dist/public -p ${PORT:-3000})"]
