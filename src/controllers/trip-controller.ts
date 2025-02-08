import { Response, NextFunction } from "express";
import { db } from "../db/setup";
import { users } from "../db/schema/users";
import { eq } from "drizzle-orm";
import { trips } from "../db/schema/trips";
import { ProtectedRequest } from "types/app-requests";
import { SuccessResponse } from "../core/api-response";
import { tripStatus } from "../db/schema/trips";
import "dotenv/config";
import jwt from "jsonwebtoken";
import Decimal from "decimal.js";

type NewTrip = typeof trips.$inferInsert;

export const handleInitiateTrip = async (
  req: ProtectedRequest,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.user!;

  const authorisedUser = await db.query.users.findFirst({
    where: eq(users.id, id),
    with: {
      operator: true,
      ticketer: true,
    },
  });

  const userId = authorisedUser?.id;
  const operatorId = authorisedUser?.operatorId;
  const ticketerId = authorisedUser?.ticketer?.id;

  const tripToken = jwt.sign(
    {
      tripInfo: {
        userId,
        operatorId,
        ticketerId,
      },
    },
    process.env.TRIP_TOKEN_SECRET!,
    { expiresIn: "6h" }
  );

  const newTrip: NewTrip = {
    endTime: null,
    ticketsIssued: 0,
    grossIncome: "0.00",
    status: tripStatus.ONGOING,
    ticketerId,
    operatorId,
  };

  const response = await db.insert(trips).values(newTrip).returning();

  try {
    return new SuccessResponse(
      "TRIP_INITIATED",
      "Trip initiated successfully",
      { tripToken, ...response[0] }
    ).send(res);
  } catch (error) {
    console.log(error);
    next(error);
  }
};
