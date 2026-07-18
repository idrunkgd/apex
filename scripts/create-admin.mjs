// Crée (ou met à jour) un compte administrateur à partir des variables d'environnement.
// ADMIN_EMAIL et ADMIN_PASSWORD requis. Exécutable avec node en production.
import { createClient } from "@libsql/client";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

const email = String(process.env.ADMIN_EMAIL || "").trim().toLowerCase();
const pw = String(process.env.ADMIN_PASSWORD || "");
if (!email || !pw) {
  console.log("• create-admin ignoré (ADMIN_EMAIL / ADMIN_PASSWORD non définis)");
  process.exit(0);
}

const client = createClient({ url: process.env.DATABASE_URL || "file:./dev.db" });
const hash = await bcrypt.hash(pw, 10);
const nom = process.env.ADMIN_NOM || "Administrateur";

const existing = await client.execute({ sql: "select id from users where email=?", args: [email] });
if (existing.rows[0]) {
  await client.execute({ sql: "update users set password_hash=?, role='ADMIN', actif=1 where email=?", args: [hash, email] });
  console.log("✓ Admin mis à jour :", email);
} else {
  await client.execute({
    sql: "insert into users (id,email,password_hash,nom,role,actif) values (?,?,?,?,'ADMIN',1)",
    args: [randomUUID(), email, hash, nom],
  });
  console.log("✓ Admin créé :", email);
}
client.close();
