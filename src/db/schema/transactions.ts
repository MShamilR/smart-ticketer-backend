import {
  pgTable,
  varchar,
  bigint,
  timestamp,
  pgEnum,
  serial,
  integer,
} from "drizzle-orm/pg-core";
import createEnumObject from "../../utils/enumGenerator";
import { purchases } from "./purchases";
import { invoices } from "./invoices";

// export const txnStatuses = ["PENDING", "COMPLETED", "FAILED"] as const;
// export const TRANSACTION_STATUSES = createEnumObject(txnStatuses);
// export const statusEnum = pgEnum("status", txnStatuses);

export const txnTypes = ["TOPUP", "CONSUME", "REFUND"] as const;
export const TRANSACTION_TYPES = createEnumObject(txnTypes);
export const typeEnum = pgEnum("type", txnTypes);

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  timestamp: timestamp("timestamp", { withTimezone: true })
    .notNull()
    .defaultNow(),
  // purchaseId: integer("purchase_id").references(
  //   () => purchases.id
  // ),
  // invoiceId: integer("invoice_id").references(
  //   () => invoices.id
  // ),
  type: typeEnum("type"),
  paymentMethod: varchar("payment_method", { length: 20 }),
  amount: bigint("amount", { mode: "bigint" }).notNull(),
  // status: statusEnum("status"),
});

// Refunds (if featured) will have a transaction record as well as an invoice for the relevant purchase id
