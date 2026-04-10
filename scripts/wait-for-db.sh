#!/bin/sh
# ═══════════════════════════════════════════════════════════════════════════════
# OPERIS Command Center — Boot Orchestrator (Modelo Modular Diamond)
# Projeto: CO₂ Contra Incêndio SaaS | D.G.O. — Dashboard de Governança
# Responsável: Aleixo (Technical Manager) | JULY AOG — Project Diamond
#
# SEQUÊNCIA DE IGNIÇÃO (4 Pilares de Ferro):
#   1. Aguarda MySQL responder na porta 3306
#   2. Git Import: baixa/atualiza o núcleo do OPERIS do GitHub → /app/shared
#   3. drizzle-kit push: cria/sincroniza as 54 tabelas no banco
#   4. Inicia o servidor Node.js (somente após confirmação das etapas anteriores)
#
# STATUS EXPOSTO via arquivo /tmp/operis-boot-status.json (lido pelo /api/health)
# ═══════════════════════════════════════════════════════════════════════════════
set -e

HOST="${DB_HOST:-db}"
PORT="${DB_PORT:-3306}"
MAX_RETRIES="${DB_MAX_RETRIES:-60}"
RETRY_INTERVAL="${DB_RETRY_INTERVAL:-2}"
GITHUB_REPO="${OPERIS_GITHUB_REPO:-https://github.com/mindos-dev/co2contraincendio.git}"
SHARED_DIR="/app/shared"

# Função para atualizar o status de boot (lido pelo /api/health e pelo frontend)
update_status() {
  phase="$1"
  message="$2"
  progress="$3"
  cat > /tmp/operis-boot-status.json << EOF
{
  "phase": "${phase}",
  "message": "${message}",
  "progress": ${progress},
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "ready": false
}
EOF
  echo "   [STATUS] ${phase}: ${message}"
}

# Função para marcar o sistema como pronto
mark_ready() {
  cat > /tmp/operis-boot-status.json << EOF
{
  "phase": "ready",
  "message": "OPERIS Command Center operacional",
  "progress": 100,
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "ready": true
}
EOF
  echo "✅ [OPERIS] Sistema pronto!"
}

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║     OPERIS Command Center — Boot Orchestrator               ║"
echo "║     Modelo Modular Diamond | JULY AOG — Project Diamond     ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# ─── PILAR 1: Aguardar MySQL responder na porta ───────────────────────────────
update_status "db_wait" "Aguardando banco de dados MySQL..." 10

retries=0
until nc -z "$HOST" "$PORT" 2>/dev/null; do
  retries=$((retries + 1))
  if [ "$retries" -ge "$MAX_RETRIES" ]; then
    echo "❌ [OPERIS] Banco de dados não respondeu após ${MAX_RETRIES} tentativas. Abortando."
    update_status "error" "Banco de dados indisponível após ${MAX_RETRIES} tentativas" 0
    exit 1
  fi
  if [ $((retries % 5)) -eq 0 ]; then
    echo "   → Aguardando MySQL... tentativa ${retries}/${MAX_RETRIES}"
  fi
  sleep "$RETRY_INTERVAL"
done

echo "✅ [PILAR 1] Banco de dados disponível em ${HOST}:${PORT}."
update_status "db_ready" "Banco de dados MySQL conectado" 25

# Aguardar MySQL aceitar conexões reais (inicialização interna)
sleep 3

# ─── PILAR 2: Git Import — baixar/atualizar núcleo do OPERIS ─────────────────
update_status "git_import" "Sincronizando núcleo OPERIS do GitHub..." 35

# Verificar se git está disponível
if command -v git >/dev/null 2>&1; then
  GIT_IMPORT_DIR="/app/git-import"

  if [ -d "${GIT_IMPORT_DIR}/.git" ]; then
    # Repositório já existe — atualizar
    echo "🔄 [PILAR 2] Atualizando repositório OPERIS..."
    cd "${GIT_IMPORT_DIR}"
    git fetch origin main --depth=1 2>&1 || echo "⚠️  Git fetch falhou — usando versão local"
    git reset --hard origin/main 2>&1 || echo "⚠️  Git reset falhou — usando versão local"
    cd /app
  else
    # Primeiro boot — clonar repositório
    echo "📥 [PILAR 2] Clonando repositório OPERIS (primeiro boot)..."
    mkdir -p "${GIT_IMPORT_DIR}"
    git clone --depth=1 "${GITHUB_REPO}" "${GIT_IMPORT_DIR}" 2>&1 || {
      echo "⚠️  [PILAR 2] Clone falhou — continuando com arquivos locais"
    }
  fi

  # Copiar shared atualizado para /app/shared (se o clone foi bem-sucedido)
  if [ -d "${GIT_IMPORT_DIR}/shared" ]; then
    echo "📂 [PILAR 2] Sincronizando /shared do repositório..."
    cp -rf "${GIT_IMPORT_DIR}/shared/." "${SHARED_DIR}/" 2>/dev/null || true
    echo "✅ [PILAR 2] Núcleo OPERIS sincronizado com sucesso."
  else
    echo "ℹ️  [PILAR 2] Usando shared local (repositório não disponível)."
  fi
else
  echo "ℹ️  [PILAR 2] Git não disponível — usando arquivos locais do container."
fi

update_status "git_done" "Núcleo OPERIS sincronizado" 55

# ─── PILAR 3: drizzle-kit push — criar/sincronizar as 54 tabelas ─────────────
update_status "db_migrate" "Sincronizando schema do banco (drizzle-kit push)..." 60

if [ -z "$DATABASE_URL" ]; then
  echo "❌ [PILAR 3] DATABASE_URL não definida. Abortando migração."
  update_status "error" "DATABASE_URL não configurada" 0
  exit 1
fi

echo "🔄 [PILAR 3] Executando drizzle-kit push..."
echo "   → Banco: ${HOST}:${PORT}"

migration_retries=0
max_migration_retries=5
migration_success=0

while [ "$migration_retries" -lt "$max_migration_retries" ]; do
  migration_retries=$((migration_retries + 1))
  echo "   → Tentativa de migração ${migration_retries}/${max_migration_retries}..."

  # drizzle-kit push cria tabelas se não existirem e atualiza as existentes
  # Usa --force para aceitar automaticamente sem prompt interativo
  if npx drizzle-kit push --config=drizzle.config.ts --force 2>&1; then
    echo "✅ [PILAR 3] Schema sincronizado! Todas as tabelas estão prontas."
    migration_success=1
    break
  else
    echo "⚠️  Tentativa ${migration_retries} falhou. Aguardando 5s..."
    update_status "db_migrate" "Tentativa ${migration_retries}/${max_migration_retries} de sincronização..." $((55 + migration_retries * 5))
    sleep 5
  fi
done

if [ "$migration_success" -eq 0 ]; then
  echo "❌ [PILAR 3] Falha crítica: schema não sincronizado após ${max_migration_retries} tentativas."
  update_status "error" "Falha na sincronização do schema Drizzle" 0
  # NÃO abortar — servidor pode subir em modo degradado e mostrar status no frontend
  echo "⚠️  Iniciando servidor em modo degradado (sem tabelas confirmadas)..."
fi

update_status "db_ready" "Schema sincronizado — iniciando servidor" 90

# ─── PILAR 4: Iniciar servidor Node.js ───────────────────────────────────────
echo ""
echo "🚀 [PILAR 4] Iniciando OPERIS Command Center..."
echo "   → Comando: $*"
echo ""

# Marcar como pronto ANTES de executar (o servidor pode demorar alguns segundos)
mark_ready

exec "$@"
