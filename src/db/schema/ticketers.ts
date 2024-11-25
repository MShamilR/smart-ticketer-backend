import { relations } from "drizzle-orm";
import { integer, pgTable, serial } from "drizzle-orm/pg-core";
import { users } from "./users";
import { operators } from "./operators";

// A ticketer has one operator (employer) || An operator (employer) has many ticketers
// A ticketer could be work in many buses, but limited to just one operator

// Sequence Restart Done
export const ticketers = pgTable("ticketers", {
  id: serial("id").primaryKey(),
  operatorId: integer("operator_id").references(() => operators.id),
  userId: integer("user_id").references(() => users.id),
});

export const ticketersRelations = relations(ticketers, ({ one, many }) => ({
  operator: one(operators, {
    fields: [ticketers.operatorId],
    references: [operators.id],
  }),
  user: one(users, {
    fields: [ticketers.userId],
    references: [users.id],
  }),
  //ticketers: many(ticketers),
}));
