import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { existsSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import * as schema from "@/db/schema";

const globalForDb = globalThis as unknown as { client?: ReturnType<typeof createClient> };

const url = process.env.DATABASE_URL || "file:./dev.db";

// S'assure que le dossier parent d'une base fichier existe avant d'ouvrir la
// connexion. Nécessaire pendant `next build` (phase "Collecting page data"),
// où le volume persistant (ex. /data) n'est pas encore monté : sans ça libsql
// échoue avec "Unable to open connection to local database".
if (url.startsWith("file:")) {
  const filePath = url.slice("file:".length);
  const dir = dirname(filePath);
  try {
    if (dir && dir !== "." && !existsSync(dir)) mkdirSync(dir, { recursive: true });
  } catch {
    // En lecture seule au build : on ignore, le runtime recréera le dossier.
  }
}

export const client = globalForDb.client ?? createClient({ url });
if (process.env.NODE_ENV !== "production") globalForDb.client = client;

export const db = drizzle(client, { schema });
export { schema };
