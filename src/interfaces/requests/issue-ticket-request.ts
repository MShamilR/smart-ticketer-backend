export interface Passenger {
  adults: number;
  children: number;
}

export interface IssueTicketRequest {
  passengers: Passenger;
  baseFare: number;
}
