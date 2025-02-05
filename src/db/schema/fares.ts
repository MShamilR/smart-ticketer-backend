import { pgTable, serial, numeric } from "drizzle-orm/pg-core";

export const fares = pgTable("fares", {
  id: serial("id").primaryKey(),
  amount: numeric("amount", { precision: 8, scale: 2 }),
});
