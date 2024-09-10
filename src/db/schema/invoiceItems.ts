import { pgTable, varchar, bigint, timestamp } from "drizzle-orm/pg-core";
import { invoices } from "./invoices";

export const invoiceItems = pgTable("invoice_items", {
  id: varchar("id", { length: 20 }),
  invoiceId: varchar("invoice_id", { length: 20 }).references(
    () => invoices.id
  ),
  description: varchar("description", { length: 100 }),
  type: varchar("type", { length: 20 }), // CHARGE | DISCOUNT | ADDON
  amount: bigint("amount", { mode: "bigint" }),
});
