/**
 * Aplica a migration 0015 — tabelas ART OPERIS
 * Executar: node scripts/apply-art-migration.mjs
 */
import { createConnection } from "mysql2/promise";
import { createHash } from "crypto";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import * as dotenv from "dotenv";
dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const SQL_FILE = join(__dirname, "../drizzle/0015_sweet_barracuda.sql");

const DB_URL = process.env.DATABASE_URL;
if (!DB_URL) { console.error("DATABASE_URL não definida"); process.exit(1); }

async function main() {
  const conn = await createConnection(DB_URL);
  console.log("[art-migration] Conectado ao banco");

  const content = readFileSync(SQL_FILE, "utf-8");
  const hash = createHash("sha256").update(content).digest("hex");

  // Verificar se já foi aplicada
  const [existing] = await conn.execute("SELECT hash FROM __drizzle_migrations WHERE hash = ?", [hash]);
  if (existing.length > 0) {
    console.log("[art-migration] ⏭️  Migration já aplicada");
    await conn.end();
    return;
  }

  const statements = content
    .split("--> statement-breakpoint")
    .map(s => s.trim())
    .filter(s => s.length > 0);

  let errors = 0;
  for (const stmt of statements) {
    try {
      await conn.execute(stmt);
      console.log(`[art-migration] ✅ ${stmt.substring(0, 70)}...`);
    } catch (err) {
      const msg = String(err.message || err);
      if (msg.includes("already exists") || msg.includes("Duplicate")) {
        console.log(`[art-migration] ⏭️  Já existe: ${msg.substring(0, 70)}`);
      } else {
        console.error(`[art-migration] ❌ Erro: ${msg.substring(0, 100)}`);
        errors++;
      }
    }
  }

  if (errors === 0) {
    await conn.execute("INSERT INTO __drizzle_migrations (hash, created_at) VALUES (?, ?)", [hash, Date.now()]);
    console.log("[art-migration] ✅ Migration registrada com sucesso");
  } else {
    console.error(`[art-migration] ❌ ${errors} erro(s) — migration NÃO registrada`);
  }

  await conn.end();
}

main().catch(console.error);
