import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema.ts";
import { env_vars } from "../env.ts";

const pool = new pg.Pool({
  connectionString: env_vars.DATABASE_URL,
});

export const db = drizzle(pool, { schema });
