/**
 * Aplica todas as migrations pendentes (0001 a 0014) em sequência
 * Executar: node scripts/apply-all-migrations.mjs
 */
import { createConnection } from "mysql2/promise";
import { createHash } from "crypto";
import { readFileSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import * as dotenv from "dotenv";
dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = join(__dirname, "../drizzle");

const DB_URL = process.env.DATABASE_URL;
if (!DB_URL) {
  console.error("[migrations] DATABASE_URL não definida");
  process.exit(1);
}

async function main() {
  const conn = await createConnection(DB_URL);
  console.log("[migrations] Conectado ao banco de dados");

  // Buscar migrations já aplicadas
  const [applied] = await conn.execute("SELECT hash FROM __drizzle_migrations ORDER BY created_at");
  const appliedHashes = new Set(applied.map(r => r.hash));
  console.log(`[migrations] ${appliedHashes.size} migration(s) já aplicada(s)`);

  // Listar arquivos SQL em ordem
  const files = readdirSync(MIGRATIONS_DIR)
    .filter(f => f.endsWith(".sql"))
    .sort();

  let applied_count = 0;
  let skipped_count = 0;

  for (const file of files) {
    const filePath = join(MIGRATIONS_DIR, file);
    const content = readFileSync(filePath, "utf-8");
    const hash = createHash("sha256").update(content).digest("hex");

    if (appliedHashes.has(hash)) {
      console.log(`[migrations] ⏭️  ${file} (já aplicada)`);
      skipped_count++;
      continue;
    }

    console.log(`[migrations] ▶️  Aplicando ${file}...`);

    // Dividir por statement-breakpoint e executar cada statement
    const statements = content
      .split("--> statement-breakpoint")
      .map(s => s.trim())
      .filter(s => s.length > 0);

    let stmt_errors = 0;
    for (const stmt of statements) {
      try {
        await conn.execute(stmt);
      } catch (err) {
        // Ignorar erros de "já existe" (índices, colunas duplicadas)
        const msg = String(err.message || err);
        if (
          err.code === "ER_DUP_KEYNAME" ||
          err.code === "ER_DUP_FIELDNAME" ||
          err.code === "ER_TABLE_EXISTS_ERROR" ||
          msg.includes("Duplicate key name") ||
          msg.includes("Duplicate column name") ||
          msg.includes("already exists")
        ) {
          console.log(`[migrations]   ⚠️  Ignorado (já existe): ${msg.substring(0, 80)}`);
        } else {
          console.error(`[migrations]   ❌ Erro: ${msg.substring(0, 120)}`);
          stmt_errors++;
        }
      }
    }

    if (stmt_errors === 0) {
      // Registrar migration como aplicada
      await conn.execute(
        "INSERT INTO __drizzle_migrations (hash, created_at) VALUES (?, ?)",
        [hash, Date.now()]
      );
      console.log(`[migrations] ✅ ${file} aplicada com sucesso`);
      applied_count++;
    } else {
      console.error(`[migrations] ❌ ${file} falhou com ${stmt_errors} erro(s) — não registrada`);
    }
  }

  await conn.end();
  console.log(`\n[migrations] Concluído: ${applied_count} aplicada(s), ${skipped_count} ignorada(s)`);
}

main().catch(console.error);
