import { pgTable, varchar, bigint } from "drizzle-orm/pg-core";

export const glAccounts = pgTable("gl_accounts", {
  id: varchar("id", { length: 20 }).notNull(),
  name: varchar("name", { length: 50 }),
  description: varchar("description", { length: 100 }),
  type: varchar("type", { length: 20 }),
  balance: bigint("balance", { mode: "bigint" }).notNull(),
});
