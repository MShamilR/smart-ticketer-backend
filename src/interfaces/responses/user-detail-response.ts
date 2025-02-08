import { TicketerDetailsResponse } from "./ticketer-details-response";
import { Roles } from "../../db/schema/users";
import Decimal from "decimal.js";

export interface UserDetailsResponse {
  email: string;
  role: typeof Roles;
  firstName: string;
  lastName: string;
  creditBalance: Decimal;
  qrCode: string;
  ticketerDetails: TicketerDetailsResponse;
}
