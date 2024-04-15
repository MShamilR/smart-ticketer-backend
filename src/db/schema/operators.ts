import {
  integer,
  pgEnum,
  pgTable,
  serial,
  uniqueIndex,
  varchar,
  jsonb,
} from "drizzle-orm/pg-core";
import { users } from "./users";

export const ownershipEnum = pgEnum("ownership", ["state", "private"]);

export const operators = pgTable("operators", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  ownership: ownershipEnum("ownership"),
  tradeName: varchar("trade_name", { length: 255 }),
  assignedDepot: varchar("assigned_depot", { length: 50 }),
  contactNumber: varchar("contact_number", { length: 20 }),
});
