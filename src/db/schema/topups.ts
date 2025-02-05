import {
  integer,
  pgEnum,
  pgTable,
  serial,
  timestamp,
  numeric,
} from "drizzle-orm/pg-core";
import { users } from "./users";

// Sequence Restart Done
export const paymentTypeEnum = pgEnum("payment_type", [
  "CARD",
  "BANK_TRANSFER",
]);

export const topups = pgTable("topups", {
  id: serial("id").primaryKey(),
  amount: numeric("amount", { precision: 10, scale: 2 }),
  creditedAt: timestamp("credited_at").defaultNow(),
  paymentType: paymentTypeEnum("payment_type"),
  userId: integer("user_id").references(() => users.id),
});
