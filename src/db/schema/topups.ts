import {
  integer,
  pgEnum,
  pgTable,
  serial,
  varchar,
  jsonb,
  real,
  timestamp,
} from "drizzle-orm/pg-core";
import { users } from "./users";

export const paymentTypeEnum = pgEnum("payment_type", [
  "CARD",
  "BANK_TRANSFER",
]);

export const topups = pgTable("topups", {
  id: serial("id").primaryKey(),
  amount: real("amount"),
  creditedAt: timestamp("credited_at").defaultNow(),
  paymentType: paymentTypeEnum("payment_type"),
  userId: integer("user_id").references(() => users.id),
});
