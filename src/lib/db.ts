import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "@/db/schema";

const globalForDb = globalThis as unknown as { client?: ReturnType<typeof createClient> };

const url = process.env.DATABASE_URL || "file:./dev.db";

export const client = globalForDb.client ?? createClient({ url });
if (process.env.NODE_ENV !== "production") globalForDb.client = client;

export const db = drizzle(client, { schema });
export { schema };
