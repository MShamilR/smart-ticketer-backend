import {
  pgTable,
  varchar,
  bigint,
  integer,
  timestamp,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { purchases } from "./purchases";

export const invoices = pgTable("invoices", {
  id: varchar("id", { length: 20 }),
  timestamp: timestamp("timestamp", { withTimezone: true })
    .notNull()
    .defaultNow(),
  purchaseId: varchar("purchase_id", { length: 20 }).references(
    () => purchases.id
  ),
  status: varchar("type", { length: 20 }), // PENDING | SUCCESS | FAILED
  orderAmount: bigint("order_amount", { mode: "bigint" }),
  charges: bigint("charges", { mode: "bigint" }),
  discounts: bigint("discounts", { mode: "bigint" }),
  addons: bigint("addons", { mode: "bigint" }),
  billable: bigint("billable", { mode: "bigint" }),
});
