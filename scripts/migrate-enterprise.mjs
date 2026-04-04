import mysql from "mysql2/promise";
import { readFileSync } from "fs";

const sql = readFileSync("drizzle/0012_breezy_captain_marvel.sql", "utf8");
const statements = sql.split("--> statement-breakpoint").map(s => s.trim()).filter(Boolean);

const conn = await mysql.createConnection(process.env.DATABASE_URL);
let ok = 0, fail = 0;

for (const stmt of statements) {
  try {
    await conn.execute(stmt);
    ok++;
  } catch (e) {
    const msg = e.message || "";
    if (msg.includes("already exists") || msg.includes("Duplicate")) {
      ok++;
    } else {
      console.error("FAIL:", msg.substring(0, 120));
      fail++;
    }
  }
}

await conn.end();
console.log(`Migration complete — OK: ${ok}, FAIL: ${fail}`);
