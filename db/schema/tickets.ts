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
import { buses } from "./buses";
import { trips } from "./trips";

export const tickets = pgTable("tickets", {
  id: serial("id").primaryKey(),
  tripId: integer("trip_id").references(() => trips.id),
  busId: integer("bus_id").references(() => buses.id),
  userId: integer("user_id").references(() => users.id),
  issuedAt: timestamp("issued_at").defaultNow(),
  summary: jsonb("summary").$type<{
    unitPrice: number;
    passengers: {
      adults: number;
      children: number;
    };
    totalAmount: number;
  }>(),
});
