import { relations } from "drizzle-orm";
import { integer, pgTable, serial } from "drizzle-orm/pg-core";
import { users } from "./users";
import { operators } from "./operators";
import { buses } from "./buses";

// A ticketer has one operator (employer) || An operator (employer) has many ticketers
// A ticketer could be work in many buses, but limited to just one operator

// Sequence Restart Done
export const ticketers = pgTable("ticketers", {
  id: serial("id").primaryKey(),
  busId: integer("bus_id").references(() => buses.id), // Can work in no buses (usually happens if they are unassigned later)
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
});

export const ticketersRelations = relations(ticketers, ({ one, many }) => ({
  // operator: one(operators),
  bus: one(buses, {
    fields: [ticketers.busId],
    references: [buses.id],
  }),
  user: one(users),
}));
