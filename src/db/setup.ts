import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import schema from "./schema";
import "dotenv/config";

if (!process.env.DATABASE_URL) {
  throw new Error("DB credentials error");
}
const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });
