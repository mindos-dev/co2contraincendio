import { createConnection } from './node_modules/.pnpm/mysql2@3.15.1/node_modules/mysql2/promise.js';
import { execSync } from 'child_process';

// Ler DATABASE_URL do processo do servidor
const envOutput = execSync('cat /proc/$(pgrep -f "tsx watch" | head -1)/environ 2>/dev/null || echo ""').toString();
const dbMatch = envOutput.split('\0').find(e => e.startsWith('DATABASE_URL='));
const dbUrl = dbMatch ? dbMatch.replace('DATABASE_URL=', '') : null;

if (!dbUrl) {
  console.error('DATABASE_URL not found in server process');
  process.exit(1);
}

console.log('Found DATABASE_URL:', dbUrl.slice(0, 35) + '...');

const conn = await createConnection(dbUrl);

const statements = [
  "ALTER TABLE `property_inspections` ADD `landlordSignedIp` varchar(45)",
  "ALTER TABLE `property_inspections` ADD `tenantSignedIp` varchar(45)",
  "ALTER TABLE `property_inspections` ADD `inspectorSignedIp` varchar(45)",
  "ALTER TABLE `property_inspections` ADD `landlordSignedHash` varchar(64)",
  "ALTER TABLE `property_inspections` ADD `tenantSignedHash` varchar(64)",
  "ALTER TABLE `property_inspections` ADD `inspectorSignedHash` varchar(64)",
  "ALTER TABLE `room_items` ADD `photoUrl2` text",
  "ALTER TABLE `room_items` ADD `photoGps` varchar(60)",
  "ALTER TABLE `room_items` ADD `photoTimestamp` timestamp",
];

for (const stmt of statements) {
  try {
    await conn.execute(stmt);
    console.log('OK:', stmt.slice(0, 80));
  } catch (e) {
    if (e.code === 'ER_DUP_FIELDNAME') {
      console.log('SKIP (already exists):', stmt.slice(0, 80));
    } else {
      console.error('ERROR:', e.message);
    }
  }
}

await conn.end();
console.log('Migration complete');
