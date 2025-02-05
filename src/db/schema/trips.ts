import {
  integer,
  pgTable,
  serial,
  timestamp,
  uuid,
  pgEnum,
  numeric,
} from "drizzle-orm/pg-core";
import { ticketers } from "./ticketers";
import createEnumObject from "../../utils/enumGenerator";
import { operators } from "./operators";

export const status = ["ONGOING", "COMPLETE", "TERMINATED"] as const;
export const tripStatus = createEnumObject(status);
export const statusEnum = pgEnum("status", status);

// Caution: In real world ticketers could be reassigned to other operators if they change their employer

// Sequence Restart Done
export const trips = pgTable("trips", {
  id: serial("id").primaryKey(),
  refId: uuid("ref_id").notNull().defaultRandom(),
  startTime: timestamp("start_time", { withTimezone: true })
    .notNull()
    .defaultNow(),
  endTime: timestamp("end_time", { withTimezone: true }).defaultNow(),
  ticketsIssued: integer("tickets_issued"),
  grossIncome: numeric("gross_income", { precision: 10, scale: 2 }),
  status: statusEnum("status"),
  ticketerId: integer("ticketer_id").references(() => ticketers.id),
  operatorId: integer("operator_id").references(() => operators.id),
});
