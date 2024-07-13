import { relations } from "drizzle-orm";
import { integer, pgTable, serial } from "drizzle-orm/pg-core";
import { users } from "./users";
import { operators } from "./operators";
import { buses } from "./buses";

// A ticketer has one operator (employer) || An operator (employer) has many ticketers
// A ticketer is only assign to one bus || Many ticketers can be assigned to one bus

export const ticketers = pgTable("ticketers", {
  id: serial("id").primaryKey(),
  operatorId: integer("operator_id").references(() => operators.id),
  busId: integer("bus_id").references(() => buses.id),
});

export const ticketersRelations = relations(ticketers, ({ one, many }) => ({
  operator: one(operators, {
    fields: [ticketers.operatorId],
    references: [operators.id],
  }),
  buses: one(buses, {
    fields: [ticketers.busId],
    references: [buses.id],
  }),
  ticketers: many(ticketers),
}));
