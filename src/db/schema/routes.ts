import { relations } from "drizzle-orm";
import { integer, pgTable, serial, varchar } from "drizzle-orm/pg-core";
import { buses } from "./buses";

export const routes = pgTable("routes", {
  id: serial("id").primaryKey(),
  route: varchar("route", { length: 10 }),
  stops: integer("stops"), // Used to fetch fare values from the fare table
});

export const routesRelations = relations(routes, ({ one }) => ({
  buses: one(buses),
}));
