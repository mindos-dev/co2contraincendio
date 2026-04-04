/**
 * Migra a tabela documents para o schema atual (adiciona colunas e índices)
 * Executar: node scripts/migrate-documents-table.mjs
 */
import { createConnection } from "mysql2/promise";
import * as dotenv from "dotenv";
dotenv.config();

const DB_URL = process.env.DATABASE_URL;
if (!DB_URL) {
  console.error("[migrate-documents] DATABASE_URL não definida");
  process.exit(1);
}

const alterStatements = [
  // Adicionar colunas faltantes
  "ALTER TABLE `documents` ADD COLUMN IF NOT EXISTS `equipmentId` int NULL",
  "ALTER TABLE `documents` ADD COLUMN IF NOT EXISTS `companyId` int NULL",
  "ALTER TABLE `documents` ADD COLUMN IF NOT EXISTS `documentNumber` varchar(80) NULL",
  "ALTER TABLE `documents` ADD COLUMN IF NOT EXISTS `extractedData` text NULL",
  "ALTER TABLE `documents` ADD COLUMN IF NOT EXISTS `processingStatus` enum('pending','processed','error') NOT NULL DEFAULT 'pending'",
  // Adicionar foreign keys (ignorar se já existirem)
  "ALTER TABLE `documents` ADD CONSTRAINT `documents_equipmentId_equipment_id_fk` FOREIGN KEY (`equipmentId`) REFERENCES `equipment`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION",
  "ALTER TABLE `documents` ADD CONSTRAINT `documents_companyId_saas_companies_id_fk` FOREIGN KEY (`companyId`) REFERENCES `saas_companies`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION",
  // Criar índices
  "CREATE INDEX `idx_doc_company_created` ON `documents` (`companyId`,`createdAt`)",
  "CREATE INDEX `idx_doc_equipment` ON `documents` (`equipmentId`)",
];

async function main() {
  const conn = await createConnection(DB_URL);
  console.log("[migrate-documents] Conectado ao banco de dados");

  for (const stmt of alterStatements) {
    try {
      await conn.execute(stmt);
      console.log(`[migrate-documents] ✅ OK: ${stmt.substring(0, 80)}...`);
    } catch (err) {
      const msg = String(err.message || err);
      if (
        err.code === "ER_DUP_KEYNAME" ||
        err.code === "ER_DUP_FIELDNAME" ||
        err.code === "ER_FK_DUP_NAME" ||
        msg.includes("Duplicate key name") ||
        msg.includes("Duplicate column name") ||
        msg.includes("Duplicate foreign key") ||
        msg.includes("already exists")
      ) {
        console.log(`[migrate-documents] ⏭️  Já existe: ${msg.substring(0, 80)}`);
      } else {
        console.error(`[migrate-documents] ❌ Erro: ${msg.substring(0, 120)}`);
      }
    }
  }

  await conn.end();
  console.log("[migrate-documents] Concluído");
}

main().catch(console.error);
