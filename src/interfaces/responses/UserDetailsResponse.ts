import { Roles } from "../../db/schema/users";
import { TicketerDetailsResponse } from "./TicketerDetailsResponse";

export interface UserDetailsResponse {
  email: string;
  role: typeof Roles;
  firstName: string;
  lastName: string;
  qrCode: string;
  ticketerDetails: TicketerDetailsResponse;
}
