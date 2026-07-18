// Applique les migrations de base de données (exécutable avec node en production).
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { migrate } from "drizzle-orm/libsql/migrator";

const url = process.env.DATABASE_URL || "file:./dev.db";
const client = createClient({ url });
const db = drizzle(client);
await migrate(db, { migrationsFolder: "./drizzle" });
console.log("✓ Migrations appliquées (" + url + ")");
client.close();
