import dotenv from "dotenv";
import type { Config } from "drizzle-kit";

dotenv.config({
  path: "../../apps/server/.env",
});

export default {
  out: "./drizzle",
  schema: "./src/schema/index.ts",
  breakpoints: true,
  verbose: true,
  strict: true,
  dialect: "postgresql",
  casing: "snake_case",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
  },
} satisfies Config;
