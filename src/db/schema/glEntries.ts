import {
  pgTable,
  varchar,
  bigint,
  serial,
  timestamp,
  integer,
  real,
} from "drizzle-orm/pg-core";
import { glAccounts } from "./glAccounts";
import { transactions } from "./transactions";

export const glEntries = pgTable("gl_entries", {
  id: serial("id"),
  timestamp: timestamp("timestamp", { withTimezone: true })
    .notNull()
    .defaultNow(),
  glAccountId: varchar("gl_account_id", { length: 20 }).references(
    () => glAccounts.id
  ),
  transactionId: integer("transaction_id").references(
    () => transactions.id
  ),
  description: varchar("description", { length: 100 }),
  amount: real("amount"),
  standing: real("standing"),
  type: varchar("type", { length: 20 }), // CREDIT | DEBIT
});
