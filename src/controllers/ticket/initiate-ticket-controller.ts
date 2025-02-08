import { NextFunction, Response } from "express";
import { ProtectedRequest } from "../../types/app-requests";
import { BadRequestError, ForbiddenError } from "../../core/api-error";
import { users } from "../../db/schema/users";
import { SuccessResponse } from "../../core/api-response";
import jwt from "jsonwebtoken";
import { db } from "../../db/setup";
import { eq } from "drizzle-orm";
import "dotenv/config";

type User = typeof users.$inferInsert;
interface TripInfo {
  userId: number;
  operatorId: number;
  ticketerId: number;
}

interface TicketInfo {
  passengerId: number;
  tripInfo: TripInfo;
}

export const handleInitiateTicket = async (
  req: ProtectedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.user!;
    const terminal = req.params.terminal;
    const tripToken = req.headers["x-trip-token"] as string | undefined;
    if (!tripToken) {
      throw new BadRequestError("MISSING_TOKEN", "Missing Trip Token");
    }
    const tripInfo = verifyTripToken(id, tripToken);
    const foundPassenger = await verifyPassengerByTerminal(terminal);
    const ticketToken = issueTicketToken(tripInfo, foundPassenger);
    const expiry = new Date(
      Date.now() + parseInt(process.env.TICKET_WINDOW_MINUTES!, 10) * 60 * 1000
    ).toISOString();

    return new SuccessResponse(
      "TICKET_WINDOW_INITIATED",
      "Ticket window initiated",
      { ticketToken, expiry }
    ).send(res);
  } catch (error) {
    next(error);
  }
};

const issueTicketToken = (tripInfo: TripInfo, foundPassenger: User) => {
  const ticketToken = jwt.sign(
    {
      ticketInfo: {
        passengerId: foundPassenger.id,
        ...tripInfo,
      },
    },
    process.env.TRIP_TOKEN_SECRET!,
    { expiresIn: process.env.TICKET_WINDOW_MINUTES }
  );
  return ticketToken;
};

const verifyTripToken = (id: number, tripToken: string): TripInfo => {
  try {
    const decodedToken = jwt.verify(
      tripToken,
      process.env.TRIP_TOKEN_SECRET!
    ) as {
      tripInfo: { userId: number; operatorId: number; ticketerId: number };
    };

    const { tripInfo } = decodedToken;

    if (id !== tripInfo.userId) {
      throw new ForbiddenError(
        "USER_UNAUTHORIZED",
        "You don't have permission to access this endpoint"
      );
    }

    return tripInfo;
  } catch (err: any) {
    if (err.name === "TokenExpiredError") {
      throw new BadRequestError("EXPIRED_TOKEN", "Your auth token has expired");
    } else {
      throw new BadRequestError("INVALID_TOKEN", "Your auth token is invalid");
    }
  }
};

const verifyPassengerByTerminal = async (terminal: string): Promise<User> => {
  const foundPassenger = await db.query.users.findFirst({
    where: eq(users.terminal, terminal),
  });
  if (!foundPassenger) {
    throw new BadRequestError("PASSENGER_UNKNOWN", "Invalid Passenger QR");
  } else if (foundPassenger.isActive) {
    throw new BadRequestError("PASSENGER_INACTIVE", "Passenger is Inactive");
  }
  return foundPassenger as User;
};
