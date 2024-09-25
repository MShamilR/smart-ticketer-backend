import { pgTable, varchar, bigint, timestamp, integer, serial } from "drizzle-orm/pg-core";
import { invoices } from "./invoices";

export const invoiceItems = pgTable("invoice_items", {
  id: serial("id").primaryKey(),
  invoiceId: integer("invoice_id").references(
    () => invoices.id
  ),
  description: varchar("description", { length: 100 }),
  type: varchar("type", { length: 20 }), // CHARGE | DISCOUNT | ADDON
  amount: bigint("amount", { mode: "bigint" }),
});
