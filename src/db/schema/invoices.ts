import {
  pgTable,
  varchar,
  integer,
  timestamp,
  serial,
  numeric,
} from "drizzle-orm/pg-core";
import { purchases } from "./purchases";

export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  timestamp: timestamp("timestamp", { withTimezone: true })
    .notNull()
    .defaultNow(),
  purchaseId: integer("purchase_id")
    .references(() => purchases.id)
    .notNull(),
  status: varchar("type", { length: 20 }), // PENDING | SUCCESS | FAILED
  amountPayable: numeric("amount_payable", {
    precision: 10,
    scale: 2,
  }).notNull(),
  orderAmount: numeric("order_amount", { precision: 10, scale: 2 }).notNull(),
  charges: numeric("charges", { precision: 10, scale: 2 }),
  discounts: numeric("discounts", { precision: 10, scale: 2 }),
  addons: numeric("addons", { precision: 10, scale: 2 }),
  billable: numeric("billable", { precision: 10, scale: 2 }),
});
