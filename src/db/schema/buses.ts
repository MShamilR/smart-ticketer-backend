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
import { operators } from "./operators";
import { ticketers } from "./ticketers";

export const buses = pgTable("buses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  operatorId: integer("operator_id").references(() => operators.id),
  registrationPlate: varchar("registration_plate", { length: 10 }),
  routeNo: varchar("route_no", { length: 10 }),
  stops: integer("stops"),
});

export const busesRelations = relations(buses, ({ one, many }) => ({
  invitee: one(operators, {
    fields: [buses.operatorId],
    references: [operators.id],
  }),
  ticketers: many(ticketers),
}));
