import { defineConfig } from "drizzle-kit";
import "dotenv/config";
import process from "node:process";

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
