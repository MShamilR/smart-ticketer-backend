import { relations } from "drizzle-orm";
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
import { ticketers } from "./ticketers";

export const ownershipEnum = pgEnum("ownership", ["state", "private"]);

export const operators = pgTable("operators", {
  id: serial("id").primaryKey(),
  ownership: ownershipEnum("ownership"),
  tradeName: varchar("trade_name", { length: 255 }),
  assignedDepot: varchar("assigned_depot", { length: 50 }),
  contactNumber: varchar("contact_number", { length: 20 }),
});

export const operatorsRelations = relations(operators, ({ many }) => ({
  users: many(users),
  ticketers: many(ticketers)
}));
