import type { Config } from "drizzle-kit";

const url = process.env.TURSO_DATABASE;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
    throw new Error("Set TURSO_DATABASE and TURSO_AUTH_TOKEN in app/.env before running database commands.");
}

export default {
    schema: "./src/db/schema.ts",
    dialect: "turso",
    dbCredentials: {
        url,
        authToken,
    },
    verbose: true,
    strict: true
} satisfies Config
