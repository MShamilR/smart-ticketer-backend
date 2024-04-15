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

export const buses = pgTable("buses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  operatorId: integer("operator_id").references(() => operators.id),
  registrationPlate: varchar("registration_plate", { length: 10 }),
  routeNo: varchar("route_no", { length: 10 }),
  stops: integer("stops"),
});
