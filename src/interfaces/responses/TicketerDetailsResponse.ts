import { TicketFare } from "../TicketFare";
import { ActiveSessionResponse } from "./ActiveSessionResponse";

export interface TicketerDetailsResponse {
  tradeName: string;
  ticketFares: TicketFare[];
  activeSession: ActiveSessionResponse;
}
