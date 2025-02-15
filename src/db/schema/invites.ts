import { integer, pgTable, serial, boolean, pgEnum } from "drizzle-orm/pg-core";
import createEnumObject from "../../utils/enum-generator";
import { operators } from "./operators";
import { users } from "./users";
import { buses } from "./buses";

export const status = ["PENDING", "ACCEPTED", "REJECTED"] as const;
export const inviteStatus = createEnumObject(status);
export const statusEnum = pgEnum("status", status);

export const invites = pgTable("invites", {
  id: serial("id").primaryKey(),
  operatorId: integer("operator_id").references(() => operators.id),
  busId: integer("bus_id").references(() => buses.id),
  userId: integer("user_id").references(() => users.id),
  status: statusEnum("status"),
});

// export const invitesRelations = relations(invites, ({ many, one }) => ({
//   user: one(users),
// }));
