import {
  integer,
  pgEnum,
  pgTable,
  serial,
  uniqueIndex,
  varchar,
  real,
  timestamp
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { buses } from "./buses";

export const trips = pgTable("trips", {
  id: serial("id").primaryKey(),
  busId: integer("bus_id").references(() => buses.id),
  startTime: timestamp("start_time").defaultNow(),
  endTime: timestamp("end_time").defaultNow(),
  totalPassengers: integer("total_passengers"),
  totalIncome: real("total_income"),
});
