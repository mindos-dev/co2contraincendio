import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";

const conn = await mysql.createConnection(process.env.DATABASE_URL);

// Verificar senha do admin
const [users] = await conn.execute(
  "SELECT passwordHash, companyId FROM saas_users WHERE email = ?",
  ["admin@co2contraincendio.com.br"]
);

if (!users.length) {
  console.log("ERRO: Admin não encontrado no banco!");
  // Criar admin
  const hash = await bcrypt.hash("CO2Admin@2025", 10);
  await conn.execute(
    "INSERT INTO saas_users (name, email, passwordHash, role, companyId, active) VALUES (?, ?, ?, ?, ?, ?)",
    ["Administrador CO2", "admin@co2contraincendio.com.br", hash, "admin", 1, 1]
  );
  console.log("Admin criado com sucesso!");
} else {
  const valid = await bcrypt.compare("CO2Admin@2025", users[0].passwordHash);
  console.log("Admin encontrado. Senha válida:", valid);
  console.log("companyId:", users[0].companyId);

  if (!valid) {
    // Resetar senha
    const hash = await bcrypt.hash("CO2Admin@2025", 10);
    await conn.execute(
      "UPDATE saas_users SET passwordHash = ? WHERE email = ?",
      [hash, "admin@co2contraincendio.com.br"]
    );
    console.log("Senha resetada para CO2Admin@2025");
  }
}

// Remover empresa duplicada
const [companies] = await conn.execute("SELECT id, name FROM saas_companies ORDER BY id");
console.log("Empresas:", companies);
if (companies.length > 1) {
  for (const c of companies.slice(1)) {
    await conn.execute("DELETE FROM saas_companies WHERE id = ?", [c.id]);
    console.log("Empresa duplicada removida: ID", c.id);
  }
}

await conn.end();
console.log("Verificação concluída.");
