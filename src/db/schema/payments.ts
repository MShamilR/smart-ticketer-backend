import {
  pgTable,
  varchar,
  bigint,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";
import createEnumObject from "../../utils/enumGenerator";
import { purchases } from "./purchases";
import { invoices } from "./invoices";
import { serial } from "drizzle-orm/pg-core";

export const pymtStatuses = ["PENDING", "COMPLETED", "FAILED"] as const;
export const TRANSACTION_STATUSES = createEnumObject(pymtStatuses);
export const statusEnum = pgEnum("status", pymtStatuses);

export const pymtTypes = ["TOPUP", "CONSUME", "REFUND"] as const;
export const TRANSACTION_TYPES = createEnumObject(pymtTypes);
export const typeEnum = pgEnum("type", pymtTypes);

export const payments = pgTable("payments", {
  id: serial("id").primaryKey().notNull(),
  timestamp: timestamp("timestamp", { withTimezone: true })
    .notNull()
    .defaultNow(),
  transactionId: varchar("transaction_id", { length: 20 }).references(
    () => purchases.id
  ),
  invoiceId: varchar("invoice_id", { length: 20 }).references(
    () => invoices.id
  ),
  type: typeEnum("type"),
  paymentMethod: varchar("payment_method", { length: 20 }),
  amount: bigint("amount", { mode: "bigint" }).notNull(),
  status: statusEnum("status"),
});

// Refunds (if featured) will have a transaction record as well as an invoice for the relevant purchase id
