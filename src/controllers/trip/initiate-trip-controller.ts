import { Response, NextFunction } from "express";
import { db } from "../../db/setup";
import { users } from "../../db/schema/users";
import { eq } from "drizzle-orm";
import { trips } from "../../db/schema/trips";
import { ProtectedRequest } from "types/app-requests";
import { SuccessResponse } from "../../core/api-response";
import { tripStatus } from "../../db/schema/trips";
import "dotenv/config";
import jwt from "jsonwebtoken";
import createLogger from "../../utils/logger";

const logger = createLogger("initiate-trip-controller");

type NewTrip = typeof trips.$inferInsert;

export const handleInitiateTrip = async (
  req: ProtectedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.user!;
    logger.info("Initiating trip request", { userId: id });

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

    logger.info("Generating trip token", { userId, operatorId, ticketerId });

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

    logger.info("Inserting new trip into database", { operatorId, ticketerId });

    const response = await db.insert(trips).values(newTrip).returning();

    logger.info("Trip initiated successfully", {
      tripId: response[0].id,
      operatorId,
      ticketerId,
    });

    return new SuccessResponse(
      "TRIP_INITIATED",
      "Trip initiated successfully",
      { tripToken, ...response[0] }
    ).send(res);
  } catch (error) {
    logger.error("Error initiating trip", { error });
    next(error);
  }
};
