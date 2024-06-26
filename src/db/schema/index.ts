import * as buses from "./buses";
import * as emails from "./emails";
import * as fares from "./fares";
import * as operators from "./operators";
import * as tickets from "./tickets";
import * as topups from "./topups";
import * as trips from "./trips";
import * as users from "./users";

const schema = {
  ...buses,
  ...fares,
  ...operators,
  ...tickets,
  ...topups,
  ...trips,
  ...users,
  ...emails,
};

export default schema;
