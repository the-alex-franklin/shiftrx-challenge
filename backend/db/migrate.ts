import { migrate } from "drizzle-orm/node-postgres/migrator";
import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { env_vars } from "../env.ts";

const pool = new pg.Pool({
  connectionString: env_vars.DATABASE_URL,
});

const db = drizzle(pool);
await migrate(db, { migrationsFolder: "./db/migrations" });
await pool.end();
console.log("Migrations complete");
