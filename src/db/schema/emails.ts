import { pgTable, uuid, varchar } from "drizzle-orm/pg-core";

export const emails = pgTable("emails", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 100 }).notNull(),
});
