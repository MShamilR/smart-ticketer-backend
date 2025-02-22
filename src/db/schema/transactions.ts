import {
  pgTable,
  varchar,
  bigint,
  timestamp,
  pgEnum,
  serial,
  integer,
} from "drizzle-orm/pg-core";
import createEnumObject from "../../utils/enum-generator";
import { purchases } from "./purchases";
import { invoices } from "./invoices";

// export const txnStatuses = ["PENDING", "COMPLETED", "FAILED"] as const;
// export const TRANSACTION_STATUSES = createEnumObject(txnStatuses);
// export const statusEnum = pgEnum("status", txnStatuses);

export const txnTypes = ["TOPUP", "CONSUME", "REFUND", "CREATE"] as const;
export const TRANSACTION_TYPES = createEnumObject(txnTypes);
export const typeEnum = pgEnum("type", txnTypes);

// Sequence Restart Done
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  timestamp: timestamp("timestamp", { withTimezone: true })
    .notNull()
    .defaultNow(),
  type: typeEnum("type"),
});

// Refunds (if featured) will have a transaction record as well as an invoice for the relevant purchase id
