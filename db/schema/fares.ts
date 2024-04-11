import {
  integer,
  pgEnum,
  pgTable,
  serial,
  varchar,
  jsonb,
  real,
  timestamp,
} from "drizzle-orm/pg-core";

export const fares = pgTable("fares", {
  id: serial("id").primaryKey(),
  amount: real("amount"),
});
