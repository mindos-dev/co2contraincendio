/**
 * Aplica a migration 0016: ADD artNumber + índice na tabela art_services
 */
import mysql from "mysql2/promise";

const conn = await mysql.createConnection(process.env.DATABASE_URL);

try {
  console.log("[Migration 0016] Adicionando coluna artNumber...");
  await conn.execute("ALTER TABLE `art_services` ADD COLUMN IF NOT EXISTS `artNumber` varchar(20)");
  console.log("[Migration 0016] Criando índice idx_art_number...");
  try {
    await conn.execute("CREATE INDEX `idx_art_number` ON `art_services` (`artNumber`)");
  } catch (e) {
    if (String(e).includes("Duplicate key name")) {
      console.log("[Migration 0016] Índice já existe, ignorando.");
    } else throw e;
  }
  console.log("[Migration 0016] ✅ Concluída com sucesso!");
} finally {
  await conn.end();
}
