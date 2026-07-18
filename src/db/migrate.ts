import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { migrate } from "drizzle-orm/libsql/migrator";

const url = process.env.DATABASE_URL || "file:./dev.db";

async function main() {
  const client = createClient({ url });
  const db = drizzle(client);
  await migrate(db, { migrationsFolder: "./drizzle" });
  console.log("✓ Migrations appliquées.");
  client.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
