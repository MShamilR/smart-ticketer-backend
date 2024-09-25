import {
  pgTable,
  varchar,
  bigint,
  integer,
  timestamp,
  serial
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { purchases } from "./purchases";

export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  timestamp: timestamp("timestamp", { withTimezone: true })
    .notNull()
    .defaultNow(),
  purchaseId: integer("purchase_id").references(() => purchases.id)
    .notNull(),
  status: varchar("type", { length: 20 }), // PENDING | SUCCESS | FAILED
  amountPayable: bigint("amount_payable", { mode: "bigint" }).notNull(),
  orderAmount: bigint("order_amount", { mode: "bigint" }).notNull(),
  charges: bigint("charges", { mode: "bigint" }),
  discounts: bigint("discounts", { mode: "bigint" }),
  addons: bigint("addons", { mode: "bigint" }),
  billable: bigint("billable", { mode: "bigint" }),
});
