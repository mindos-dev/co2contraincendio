import { createConnection } from "mysql2/promise";

const indexes = [
  "CREATE INDEX IF NOT EXISTS `idx_equipment_company_created` ON `equipment` (`companyId`,`createdAt`)",
  "CREATE INDEX IF NOT EXISTS `idx_equipment_company_status` ON `equipment` (`companyId`,`status`)",
  "CREATE INDEX IF NOT EXISTS `idx_equipment_company_next_maint` ON `equipment` (`companyId`,`nextMaintenanceDate`)",
  "CREATE INDEX IF NOT EXISTS `idx_maint_equipment_date` ON `maintenance_records` (`equipmentId`,`serviceDate`)",
  "CREATE INDEX IF NOT EXISTS `idx_maint_created` ON `maintenance_records` (`createdAt`)",
  "CREATE INDEX IF NOT EXISTS `idx_wo_company_status` ON `work_orders` (`companyId`,`status`)",
  "CREATE INDEX IF NOT EXISTS `idx_wo_company_created` ON `work_orders` (`companyId`,`createdAt`)",
];

const conn = await createConnection(process.env.DATABASE_URL);
console.log("[indexes] Conectado ao banco de dados");

for (const sql of indexes) {
  try {
    await conn.query(sql);
    const name = sql.match(/`([^`]+)`\s+ON/)?.[1];
    console.log(`[indexes] ✓ ${name}`);
  } catch (e) {
    if (e.code === "ER_DUP_KEYNAME") {
      const name = sql.match(/`([^`]+)`\s+ON/)?.[1];
      console.log(`[indexes] → ${name} já existe, pulando`);
    } else {
      console.error(`[indexes] ✗ Erro: ${e.message}`);
    }
  }
}

await conn.end();
console.log("[indexes] Concluído");
