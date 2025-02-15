import { TicketFareResponse } from "./ticket-fare-response";
import { ActiveSessionResponse } from "./active-session-response";

export interface TicketerDetailsResponse {
  tradeName: string;
  // ticketFares: TicketFareResponse[];
  activeSession: ActiveSessionResponse | null;
}
