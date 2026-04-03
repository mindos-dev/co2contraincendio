import mysql from "mysql2/promise";

const conn = await mysql.createConnection(process.env.DATABASE_URL);

const sqls = [
  `CREATE TABLE IF NOT EXISTS \`cookie_consents\` (
    \`id\` int AUTO_INCREMENT NOT NULL,
    \`userId\` int,
    \`sessionId\` varchar(100),
    \`consentType\` enum('all','custom','essential_only') NOT NULL,
    \`essential\` boolean NOT NULL DEFAULT true,
    \`performance\` boolean NOT NULL DEFAULT false,
    \`analytics\` boolean NOT NULL DEFAULT false,
    \`ipAddress\` varchar(45),
    \`userAgent\` varchar(500),
    \`createdAt\` timestamp NOT NULL DEFAULT (now()),
    CONSTRAINT \`cookie_consents_id\` PRIMARY KEY(\`id\`)
  )`,
  `CREATE TABLE IF NOT EXISTS \`lgpd_requests\` (
    \`id\` int AUTO_INCREMENT NOT NULL,
    \`userId\` int NOT NULL,
    \`type\` enum('export','delete','correction','access','portability') NOT NULL,
    \`status\` enum('pending','processing','completed','rejected') NOT NULL DEFAULT 'pending',
    \`notes\` text,
    \`processedAt\` timestamp,
    \`createdAt\` timestamp NOT NULL DEFAULT (now()),
    CONSTRAINT \`lgpd_requests_id\` PRIMARY KEY(\`id\`)
  )`,
];

for (const sql of sqls) {
  try {
    await conn.execute(sql);
    console.log("OK:", sql.substring(0, 60));
  } catch (e) {
    console.log("SKIP:", e.message.substring(0, 80));
  }
}

// Add FK if not exists (ignore errors)
try {
  await conn.execute(`ALTER TABLE \`cookie_consents\` ADD CONSTRAINT \`cookie_consents_userId_fk\` FOREIGN KEY (\`userId\`) REFERENCES \`saas_users\`(\`id\`)`);
} catch {}
try {
  await conn.execute(`ALTER TABLE \`lgpd_requests\` ADD CONSTRAINT \`lgpd_requests_userId_fk\` FOREIGN KEY (\`userId\`) REFERENCES \`saas_users\`(\`id\`)`);
} catch {}

await conn.end();
console.log("Migration LGPD concluída.");
