import {
  integer,
  pgTable,
  serial,
  real,
  timestamp,
  uuid,
  pgEnum,
} from "drizzle-orm/pg-core";
import { ticketers } from "./ticketers";
import createEnumObject from "../../utils/enumGenerator";
import { operators } from "./operators";

export const status = ["ONGOING", "COMPLETE", "TERMINATED"] as const;
export const tripStatus = createEnumObject(status);
export const statusEnum = pgEnum("status", status);

// Caution: In real world ticketers could be reassigned to other operators if they change their employer

export const trips = pgTable("trips", {
  id: serial("id").primaryKey(),
  refId: uuid("ref_id").primaryKey().notNull().defaultRandom(),
  startTime: timestamp("start_time", { withTimezone: true })
    .notNull()
    .defaultNow(),
  endTime: timestamp("end_time", { withTimezone: true }).defaultNow(),
  ticketsIssued: integer("tickets_issued"),
  grossIncome: real("gross_income"),
  status: statusEnum("status"),
  ticketerId: integer("ticketer_id").references(() => ticketers.id),
  operatorId: integer("operator_id").references(() => operators.id),
});
