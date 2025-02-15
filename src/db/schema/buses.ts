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
import { operators } from "./operators";
import { ticketers } from "./ticketers";
import { routes } from "./routes";

export const buses = pgTable("buses", {
  id: serial("id").primaryKey(),
  operatorId: integer("operator_id")
    .references(() => operators.id)
    .notNull(),
  registrationPlate: varchar("registration_plate", { length: 10 }),
  routeId: integer("route_id")
    .references(() => routes.id)
    .notNull(),
});

export const busesRelations = relations(buses, ({ one, many }) => ({
  operators: one(operators),
  ticketers: many(ticketers),
  routes: one(routes),
  // invitee: one(operators, {
  //   fields: [buses.operatorId],
  //   references: [operators.id],
  // }),
}));
