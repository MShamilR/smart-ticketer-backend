import { NextFunction, Response } from "express";
import { ProtectedRequest } from "../../types/app-requests";
import { BadRequestError, ForbiddenError } from "../../core/api-error";
import { users } from "../../db/schema/users";
import { SuccessResponse } from "../../core/api-response";
import jwt from "jsonwebtoken";
import { db } from "../../db/setup";
import { eq } from "drizzle-orm";
import "dotenv/config";
import {
  IssueTicketRequest,
  Passenger,
} from "interfaces/requests/issue-ticket-request";
import AccountsManager from "accounting/accounts-manager";
import Decimal from "decimal.js";

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

export const handleCompleteTicket = async (
  req: ProtectedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.user!;
    const terminal = req.params.terminal;

    const ticketToken = req.headers["x-ticket-token"] as string | undefined;
    if (!ticketToken) {
      throw new BadRequestError("MISSING_TOKEN", "Missing Trip Token");
    }

    const ticketInfo = verifyTicketToken(id, ticketToken);
    const foundPassenger = await verifyPassengerById(ticketInfo.passengerId);
    if (terminal !== foundPassenger.terminal) {
      throw new ForbiddenError(
        "TERMINAL_MISMATCH",
        "You don't have permission to access this endpoint"
      );
    }

    const { passengers, baseFare } = <IssueTicketRequest>req.body;
    const totalFare = calculateTotalFare(passengers, baseFare);
    AccountsManager.creditsConsume(id, totalFare);

    const user = await db.query.users.findFirst({
      where: eq(users.id, id),
    });

    const updatedCreditBalance = new Decimal(user!.creditBalance!).minus(
      totalFare
    );

    await db
      .update(users)
      .set({ creditBalance: updatedCreditBalance.toString() })
      .where(eq(users.id, user!.id!));

    return new SuccessResponse("TICKET_ISSUED", "Ticket issued successfully", {
      // Todo
      // Route
      // Bus Number
      // Ticket Info
      // Issued By
    }).send(res);
  } catch (error) {
    next(error);
  }
};

const calculateTotalFare = (
  passengers: Passenger,
  baseFare: number
): Decimal => {
  let totalFare = new Decimal(0);
  totalFare = totalFare.plus(new Decimal(passengers.adults).times(baseFare));
  totalFare = totalFare.plus(
    new Decimal(passengers.children)
      .times(baseFare)
      .times(new Decimal(process.env.TICKET_CHILD_RATIO!))
  );

  return totalFare;
};

const verifyTicketToken = (id: number, ticketToken: string): TicketInfo => {
  try {
    const decodedToken = jwt.verify(
      ticketToken,
      process.env.TICKET_TOKEN_SECRET!
    ) as {
      ticketInfo: {
        passengerId: number;
        tripInfo: { userId: number; operatorId: number; ticketerId: number };
      };
    };

    const { ticketInfo } = decodedToken;

    if (id !== ticketInfo.tripInfo.userId) {
      throw new ForbiddenError(
        "USER_UNAUTHORIZED",
        "You don't have permission to access this endpoint"
      );
    }

    return ticketInfo;
  } catch (err: any) {
    if (err.name === "TokenExpiredError") {
      throw new BadRequestError("EXPIRED_TOKEN", "Your auth token has expired");
    } else {
      throw new BadRequestError("INVALID_TOKEN", "Your auth token is invalid");
    }
  }
};

const verifyPassengerById = async (id: number): Promise<User> => {
  const foundPassenger = await db.query.users.findFirst({
    where: eq(users.id, id),
  });
  if (!foundPassenger) {
    throw new BadRequestError("PASSENGER_UNKNOWN", "Invalid Passenger QR");
  } else if (foundPassenger.isActive) {
    throw new BadRequestError("PASSENGER_INACTIVE", "Passenger is Inactive");
  }
  return foundPassenger as User;
};
