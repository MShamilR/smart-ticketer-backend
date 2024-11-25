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
  numeric,
  doublePrecision,
} from "drizzle-orm/pg-core";
import { buses } from "./buses";
import { operators } from "./operators";
import createEnumObject from "../../utils/enumGenerator";
import { ticketers } from "./ticketers";
import { invites } from "./invites";
import { glAccounts } from "./glAccounts";

export const appRoles = [
  "PASSENGER",
  "TICKETER",
  "BUS_OPERATOR",
  "APP_ADMINISTRATOR",
] as const;

export const Roles = createEnumObject(appRoles);

export const rolesEnum = pgEnum("role", appRoles);
// Sequence Restart Done
export const users = pgTable("users", {
  id: serial("id").primaryKey().notNull(),
  terminal: varchar("terminal").notNull(),
  firstName: varchar("first_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }),
  email: varchar("email", { length: 100 }).unique().notNull(),
  passwordHash: varchar("password_hash", { length: 256 }).notNull(),
  refreshToken: varchar("refresh_token", { length: 256 }),
  role: rolesEnum("role"),
  glAccountId: varchar("gl_account_id").references(() => glAccounts.id),
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
  glAccount: one(glAccounts, {
    fields: [users.glAccountId],
    references: [glAccounts.id],
  }),
  //invite: one(invites)
  // ticketer: one(ticketers, {
  //   fields: [users.ticketerId],
  //   references: [ticketers.id],
  // }),
}));
