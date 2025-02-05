import {
  pgTable,
  varchar,
  serial,
  timestamp,
  integer,
  numeric,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { payments } from "./payments";

// Sequence Restart Done
export const purchases = pgTable("purchases", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  timestamp: timestamp("timestamp", { withTimezone: true })
    .notNull()
    .defaultNow(),
  amount: numeric("amount", { precision: 10, scale: 2 }),
  status: varchar("status", { length: 10 }),
});
