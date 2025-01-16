import {
  integer,
  pgTable,
  serial,
  varchar,
  timestamp,
} from "drizzle-orm/pg-core";

export const otps = pgTable("otps", {
  id: serial("id").primaryKey(),
  secret: varchar("secret", { length: 50 }),
  email: varchar("email", { length: 100 }),
  otp: varchar("otp", { length: 5 }),
  timestamp: timestamp("timestamp", { withTimezone: true }).defaultNow(),
});


