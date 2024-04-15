import * as buses from "./buses.ts";
import * as fares from "./fares.ts";
import * as operators from "./operators.ts";
import * as tickets from "./tickets.ts";
import * as topups from "./topups.ts";
import * as trips from "./trips.ts";
import * as users from "./users.ts";

const schema = {
  ...buses,
  ...fares,
  ...operators,
  ...tickets,
  ...topups,
  ...trips,
  ...users,
};

export default schema;
