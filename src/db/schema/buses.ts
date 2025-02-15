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

export const buses = pgTable("buses", {
  id: serial("id").primaryKey(),
  operatorId: integer("operator_id")
    .references(() => operators.id)
    .notNull(),
  registrationPlate: varchar("registration_plate", { length: 10 }),
  routeNo: varchar("route_no", { length: 10 }),
  stops: integer("stops"),
});

export const busesRelations = relations(buses, ({ one, many }) => ({
  operators: one(operators),
  ticketers: many(ticketers),
  // invitee: one(operators, {
  //   fields: [buses.operatorId],
  //   references: [operators.id],
  // }),
}));
