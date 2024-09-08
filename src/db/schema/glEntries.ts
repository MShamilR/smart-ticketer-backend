import {
  pgTable,
  varchar,
  bigint,
  serial,
  timestamp,
} from "drizzle-orm/pg-core";
import { glAccounts } from "./glAccounts";

export const glEntries = pgTable("gl_entries", {
  id: serial("id"),
  recordedAt: timestamp("recorded_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  glAccountId: varchar("gl_account_id", { length: 20 }).references(
    () => glAccounts.id
  ),
  type: varchar("type", { length: 20 }),
  description: varchar("description", { length: 100 }),
  amount: bigint("amount", { mode: "bigint" }),
  standing: bigint("standing", { mode: "bigint" }),
});
