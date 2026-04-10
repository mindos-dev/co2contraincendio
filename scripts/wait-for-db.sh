#!/bin/sh
# ─── OPERIS — Wait for Database ──────────────────────────────────────────────
# Aguarda o MySQL estar pronto antes de iniciar o servidor Node.js
# Evita o loop de RESTARTING (Exit Code 1) por DATABASE_URL não disponível
# ─────────────────────────────────────────────────────────────────────────────

set -e

HOST="${DB_HOST:-db}"
PORT="${DB_PORT:-3306}"
MAX_RETRIES="${DB_MAX_RETRIES:-30}"
RETRY_INTERVAL="${DB_RETRY_INTERVAL:-2}"

echo "⏳ [OPERIS] Aguardando banco de dados em ${HOST}:${PORT}..."

retries=0
until nc -z "$HOST" "$PORT" 2>/dev/null; do
  retries=$((retries + 1))
  if [ "$retries" -ge "$MAX_RETRIES" ]; then
    echo "❌ [OPERIS] Banco de dados não respondeu após ${MAX_RETRIES} tentativas. Abortando."
    exit 1
  fi
  echo "   → Tentativa ${retries}/${MAX_RETRIES} — aguardando ${RETRY_INTERVAL}s..."
  sleep "$RETRY_INTERVAL"
done

echo "✅ [OPERIS] Banco de dados disponível em ${HOST}:${PORT}."
echo "🚀 [OPERIS] Iniciando servidor Node.js..."

exec "$@"
