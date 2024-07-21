import { integer, pgTable, serial, boolean } from "drizzle-orm/pg-core";
import { operators} from "./operators";
import { users } from "./users";

export const invites = pgTable("invites", {
  id: serial("id").primaryKey(),
  operatorId: integer("operator_id").references(() => operators.id),
  userId: integer("user_id").references(() => users.id),
  isAccepted: boolean("is_accepted"),
});

// export const operatorsRelations = relations(operators, ({ many }) => ({
//   users: many(users),
//   ticketers: many(ticketers),
// }));
