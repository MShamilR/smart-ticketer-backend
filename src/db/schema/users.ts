import { relations } from "drizzle-orm";
import {
  integer,
  pgEnum,
  pgTable,
  serial,
  uniqueIndex,
  varchar,
  jsonb,
  real,
  boolean,
} from "drizzle-orm/pg-core";
import { buses } from "./buses";
import { operators } from "./operators";
import createEnumObject from "../../utils/enumGenerator";
import { ticketers } from "./ticketers";
import { invites } from "./invites";

export const appRoles = [
  "PASSENGER",
  "TICKETER",
  "BUS_OPERATOR",
  "APP_ADMINISTRATOR",
] as const;

export const Roles = createEnumObject(appRoles);

export const rolesEnum = pgEnum("role", appRoles);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  terminal: varchar("terminal").unique().notNull(),
  firstName: varchar("first_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }),
  email: varchar("email", { length: 100 }).unique().notNull(),
  passwordHash: varchar("password_hash", { length: 256 }).notNull(),
  refreshToken: varchar("refresh_token", { length: 256 }),
  role: rolesEnum("role"),
  emergencyContact: jsonb("emergency_contact").$type<{
    name: string;
    relationship: string;
    mobileNumber: string;
  }>(),
  creditBalance: real("credit_balance"),
  isActive: boolean("is_active"),
  isIncomplete: boolean("is_incomplete"),
  operatorId: integer("operator_id"),
});

// export const usersRelations = relations(users, ({ many }) => ({
//   operators: many(operators),
//   ticketers: many(ticketers),
// }));

export const usersRelations = relations(users, ({ one }) => ({
  ticketer: one(ticketers),
  operator: one(operators),
  //invite: one(invites)
  // ticketer: one(ticketers, {
  //   fields: [users.ticketerId],
  //   references: [ticketers.id],
  // }),
}));
