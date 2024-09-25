import {
  pgTable,
  varchar,
  bigint,
  serial,
  timestamp,
  integer,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { payments } from "./payments";

export const purchases = pgTable("purchases", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  timestamp: timestamp("timestamp", { withTimezone: true })
    .notNull()
    .defaultNow(),
  amount: bigint("amount", { mode: "bigint" }),
  status: varchar("status", { length: 10 }),
});
