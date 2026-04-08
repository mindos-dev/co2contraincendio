import { createConnection } from './node_modules/.pnpm/mysql2@3.15.1/node_modules/mysql2/promise.js';
import { execSync } from 'child_process';

const envOutput = execSync('cat /proc/$(pgrep -f "tsx watch" | head -1)/environ 2>/dev/null || echo ""').toString();
const dbMatch = envOutput.split('\0').find(e => e.startsWith('DATABASE_URL='));
const dbUrl = dbMatch ? dbMatch.replace('DATABASE_URL=', '') : null;

if (!dbUrl) { console.error('DATABASE_URL not found'); process.exit(1); }
console.log('Found DATABASE_URL:', dbUrl.slice(0, 35) + '...');

const conn = await createConnection(dbUrl);

const statements = [
  `CREATE TABLE IF NOT EXISTS \`engineer_partners\` (
    \`id\` int AUTO_INCREMENT NOT NULL,
    \`company_id\` int NOT NULL,
    \`name\` varchar(255) NOT NULL,
    \`crea\` varchar(60) NOT NULL,
    \`specialty\` varchar(255),
    \`phone\` varchar(30),
    \`email\` varchar(320),
    \`cpf\` varchar(20),
    \`commission_rate\` decimal(5,2) DEFAULT '0.00',
    \`fixed_fee\` decimal(10,2) DEFAULT '0.00',
    \`pix_key\` varchar(255),
    \`bank_account\` varchar(255),
    \`service_contract_url\` text,
    \`is_active\` boolean NOT NULL DEFAULT true,
    \`created_at\` timestamp DEFAULT (now()),
    \`updated_at\` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
    \`created_by_user_id\` int NOT NULL,
    CONSTRAINT \`engineer_partners_id\` PRIMARY KEY(\`id\`)
  )`,
  `CREATE TABLE IF NOT EXISTS \`freelance_payouts\` (
    \`id\` int AUTO_INCREMENT NOT NULL,
    \`company_id\` int NOT NULL,
    \`inspection_id\` int NOT NULL,
    \`engineer_partner_id\` int NOT NULL,
    \`amount\` decimal(10,2) NOT NULL,
    \`status\` enum('pending_approval','approved','paid','cancelled') NOT NULL DEFAULT 'pending_approval',
    \`payment_method\` varchar(50),
    \`payment_reference\` varchar(255),
    \`approved_by_user_id\` int,
    \`approved_at\` timestamp,
    \`paid_at\` timestamp,
    \`notes\` text,
    \`audit_log\` text,
    \`created_at\` timestamp DEFAULT (now()),
    \`updated_at\` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
    \`created_by_user_id\` int NOT NULL,
    CONSTRAINT \`freelance_payouts_id\` PRIMARY KEY(\`id\`)
  )`,
  "ALTER TABLE `property_inspections` ADD `engineer_partner_id` int",
  "ALTER TABLE `property_inspections` ADD `engineer_name` varchar(255)",
  "ALTER TABLE `property_inspections` ADD `engineer_crea` varchar(60)",
  "ALTER TABLE `property_inspections` ADD `engineer_contract_url` text",
];

for (const stmt of statements) {
  try {
    await conn.execute(stmt);
    console.log('OK:', stmt.slice(0, 70).replace(/\n/g, ' '));
  } catch (e) {
    if (e.code === 'ER_DUP_FIELDNAME' || e.code === 'ER_TABLE_EXISTS_ERROR') {
      console.log('SKIP (already exists):', stmt.slice(0, 70).replace(/\n/g, ' '));
    } else {
      console.error('ERROR:', e.message);
    }
  }
}

await conn.end();
console.log('Migration 021 complete');
