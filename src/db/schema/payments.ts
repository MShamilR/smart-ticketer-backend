import {
  pgTable,
  varchar,
  timestamp,
  pgEnum,
  serial,
  integer,
  numeric,
} from "drizzle-orm/pg-core";
import createEnumObject from "../../utils/enum-generator";
import { invoices } from "./invoices";
import { transactions } from "./transactions";

export const pymtStatuses = ["PENDING", "COMPLETED", "FAILED"] as const;
export const TRANSACTION_STATUSES = createEnumObject(pymtStatuses);
export const statusEnum = pgEnum("status", pymtStatuses);

export const pymtTypes = ["CARD", "PAYHERE", "BANK_TRANSFER"] as const;
export const TRANSACTION_TYPES = createEnumObject(pymtTypes);
export const typeEnum = pgEnum("type", pymtTypes);

// Sequence Restart Done
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  timestamp: timestamp("timestamp", { withTimezone: true })
    .notNull()
    .defaultNow(),
  // transactionId: integer("transaction_id").references(
  //   () => transactions.id
  // ),
  invoiceId: integer("invoice_id").references(() => invoices.id),
  type: typeEnum("type").notNull(),
  paymentMethod: varchar("payment_method", { length: 20 }),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  status: statusEnum("status"),
});

// Refunds (if featured) will have a transaction record as well as an invoice for the relevant purchase id
