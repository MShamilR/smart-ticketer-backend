import {
  integer,
  pgTable,
  serial,
  varchar,
  timestamp,
} from "drizzle-orm/pg-core";

export const otpLogs = pgTable("otp_logs", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 100 }),
  sent: integer("sent").default(0).notNull(),
  invalid: integer("invalid").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  lastUpdated: timestamp("last_updated", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
