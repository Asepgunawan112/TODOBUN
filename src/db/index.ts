import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";

const url = process.env.TURSO_DATABASE;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url) {
  throw new Error("TURSO_DATABASE is missing. Add your Turso database URL to app/.env.");
}

if (!authToken) {
  throw new Error("TURSO_AUTH_TOKEN is missing. Add your Turso auth token to app/.env.");
}

const client = createClient({ url, authToken });

export const db = drizzle(client, { schema });
