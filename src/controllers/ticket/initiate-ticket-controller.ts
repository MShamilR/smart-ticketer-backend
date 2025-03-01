import { NextFunction, Response } from "express";
import { ProtectedRequest } from "../../types/app-requests";
import { BadRequestError, ForbiddenError } from "../../core/api-error";
import { users } from "../../db/schema/users";
import { SuccessResponse } from "../../core/api-response";
import jwt from "jsonwebtoken";
import { db } from "../../db/setup";
import { eq } from "drizzle-orm";
import "dotenv/config";
import { redisClient } from "../../redis/config";

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

// TODO: Move Redis actions to a util function

export const handleInitiateTicket = async (
  req: ProtectedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.user!;
    const { qrCode } = req.params;
    let foundPassengerId: Number | null = null;

    const tripToken = req.headers["x-trip-token"] as string | undefined;
    if (!tripToken) {
      throw new BadRequestError("MISSING_TOKEN", "Missing Trip Token");
    }
    const tripInfo = verifyTripToken(id, tripToken);
    try {
      const cachedUserId = await redisClient.get(`QR:${qrCode}`);
      if (cachedUserId) {
        foundPassengerId = Number(cachedUserId);
      }
    } catch (error) {
      console.error("Redis GET error:", error);
    }

    if (!foundPassengerId) {
      foundPassengerId = await verifyPassengerByQrCode(qrCode);
      try {
        await redisClient.set(`QR:${qrCode}`, String(foundPassengerId), {
          EX: Number(process.env.REDIS_TTL),
        });
      } catch (error) {
        console.error("Redis SET error:", error);
      }
    }

    const ticketToken = issueTicketToken(tripInfo, foundPassengerId!);
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

const issueTicketToken = (tripInfo: TripInfo, foundPassengerId: Number) => {
  const ticketToken = jwt.sign(
    {
      ticketInfo: {
        passengerId: foundPassengerId,
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

const verifyPassengerByQrCode = async (qrCode: string): Promise<Number> => {
  const foundPassenger = await db.query.users.findFirst({
    where: eq(users.qrCode, qrCode),
  });
  if (!foundPassenger) {
    throw new BadRequestError("PASSENGER_UNKNOWN", "Invalid Passenger QR");
  } else if (foundPassenger.isActive) {
    throw new BadRequestError("PASSENGER_INACTIVE", "Passenger is Inactive");
  }
  return foundPassenger.id;
};
