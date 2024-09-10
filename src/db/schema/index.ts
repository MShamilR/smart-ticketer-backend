import * as buses from "./buses";
import * as emails from "./emails";
import * as fares from "./fares";
import * as operators from "./operators";
import * as tickets from "./tickets";
import * as topups from "./topups";
import * as trips from "./trips";
import * as users from "./users";
import * as ticketers from "./ticketers";
import * as invites from "./invites";
import * as glAccounts from "./glAccounts";
import * as glEntries from "./glEntries";
import * as purchases from "./purchases";
import * as invoices from "./invoices";
import * as invoiceItems from "./invoiceItems";

const schema = {
  ...buses,
  ...fares,
  ...operators,
  ...tickets,
  ...topups,
  ...trips,
  ...users,
  ...emails,
  ...ticketers,
  ...invites,
  ...glAccounts,
  ...glEntries,
  ...purchases,
  ...invoices,
  ...invoiceItems
};

export default schema;
