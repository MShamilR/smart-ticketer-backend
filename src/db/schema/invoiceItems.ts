import {
  pgTable,
  varchar,
  bigint,
  timestamp,
  integer,
  serial,
} from "drizzle-orm/pg-core";
import { invoices } from "./invoices";

export const invoiceItems = pgTable("invoice_items", {
  id: serial("id").primaryKey(),
  invoiceId: integer("invoice_id").references(() => invoices.id),
  subject: varchar("subject", { length: 50 }),
  type: varchar("type", { length: 20 }), // PURCHASE_ITEM | ADDON | DISCOUNT |
  amount: bigint("amount", { mode: "bigint" }),
});
