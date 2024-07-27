import { relations } from "drizzle-orm";
import { integer, pgTable, serial, boolean, pgEnum } from "drizzle-orm/pg-core";
import createEnumObject from "utils/enumGenerator";
import { operators } from "./operators";
import { users } from "./users";

export const status = ["PENDING", "ACCEPTED", "REJECTED"] as const;
export const inviteStatus = createEnumObject(status);
export const statusEnum = pgEnum("status", status);

export const invites = pgTable("invites", {
  id: serial("id").primaryKey(),
  operatorId: integer("operator_id").references(() => operators.id),
  userId: integer("user_id").references(() => users.id),
  status: statusEnum("status"),
});

// export const invitesRelations = relations(invites, ({ many, one }) => ({
//   user: one(users),
// }));
