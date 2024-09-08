import { pgTable, varchar, bigint, integer } from "drizzle-orm/pg-core";
import { users } from "./users";

export const invoices = pgTable("invoices", {
  id: varchar("id", { length: 20 }),
});
