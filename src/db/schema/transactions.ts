import {
  pgTable,
  varchar,
  bigint,
  integer,
  timestamp,
} from "drizzle-orm/pg-core";
import { purchases } from "./purchases";
import { invoices } from "./invoices";

export const transactions = pgTable("transactions", {
  id: varchar("id", { length: 20 }),
  timestamp: timestamp("timestamp", { withTimezone: true })
    .notNull()
    .defaultNow(),
  purchaseId: varchar("purchase_id", { length: 20 }).references(
    () => purchases.id
  ),
  invoiceId: varchar("invoice_id", { length: 20 }).references(
    () => invoices.id
  ),
  paymentMethod: varchar("payment_method", { length: 20 }),
  amount: bigint("amount", { mode: "bigint" }),
  status: varchar("type", { length: 20 }),
});

// Refunds (if featured) will have a transaction record as well as an invoice for the relevant purchase id
