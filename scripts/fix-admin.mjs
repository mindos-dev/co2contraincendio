import mysql from "mysql2/promise";

const conn = await mysql.createConnection(process.env.DATABASE_URL);

// Atualizar companyId do admin para 1
await conn.execute(
  "UPDATE saas_users SET companyId = 1 WHERE email = ?",
  ["admin@co2contraincendio.com.br"]
);
console.log("Admin companyId atualizado para 1");

// Verificar resultado final
const [users] = await conn.execute(
  "SELECT id, name, email, role, companyId, active FROM saas_users"
);
console.log("Usuários finais:", JSON.stringify(users, null, 2));

const [companies] = await conn.execute(
  "SELECT id, name, active FROM saas_companies"
);
console.log("Empresas finais:", JSON.stringify(companies, null, 2));

await conn.end();
