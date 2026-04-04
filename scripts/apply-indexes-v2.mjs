/**
 * Script para aplicar os índices das tabelas documents e checklist_executions
 * Executar: node scripts/apply-indexes-v2.mjs
 */
import { createConnection } from "mysql2/promise";
import * as dotenv from "dotenv";
dotenv.config();

const DB_URL = process.env.DATABASE_URL;
if (!DB_URL) {
  console.error("[apply-indexes-v2] DATABASE_URL não definida");
  process.exit(1);
}

const indexes = [
  {
    name: "idx_exec_company_created",
    sql: "CREATE INDEX `idx_exec_company_created` ON `checklist_executions` (`companyId`,`createdAt`)",
  },
  {
    name: "idx_exec_equipment",
    sql: "CREATE INDEX `idx_exec_equipment` ON `checklist_executions` (`equipmentId`)",
  },
  {
    name: "idx_exec_status",
    sql: "CREATE INDEX `idx_exec_status` ON `checklist_executions` (`companyId`,`status`)",
  },
  {
    name: "idx_doc_company_created",
    sql: "CREATE INDEX `idx_doc_company_created` ON `documents` (`companyId`,`createdAt`)",
  },
  {
    name: "idx_doc_equipment",
    sql: "CREATE INDEX `idx_doc_equipment` ON `documents` (`equipmentId`)",
  },
];

async function main() {
  const conn = await createConnection(DB_URL);
  console.log("[apply-indexes-v2] Conectado ao banco de dados");

  for (const idx of indexes) {
    try {
      await conn.execute(idx.sql);
      console.log(`[apply-indexes-v2] ✅ ${idx.name} criado`);
    } catch (err) {
      if (err.code === "ER_DUP_KEYNAME" || String(err).includes("Duplicate key name")) {
        console.log(`[apply-indexes-v2] ⏭️  ${idx.name} já existe (ignorado)`);
      } else {
        console.error(`[apply-indexes-v2] ❌ Erro em ${idx.name}:`, err.message);
      }
    }
  }

  await conn.end();
  console.log("[apply-indexes-v2] Concluído");
}

main().catch(console.error);
