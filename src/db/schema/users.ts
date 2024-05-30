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

const rolesArr = [
  "PASSENGER",
  "TICKETER",
  "BUS_OPERATOR",
  "APP_ADMINISTRATOR",
] as const;

export const Roles = createEnumObject(rolesArr);

export const rolesEnum = pgEnum("role", rolesArr);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  token: varchar("token").unique().notNull(),
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
});

export const usersRelations = relations(users, ({ one }) => ({
  bus: one(buses, {
    fields: [users.id],
    references: [buses.userId],
  }),
  operator: one(operators, {
    fields: [users.id],
    references: [operators.userId],
  }),
}));
