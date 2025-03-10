import { Decimal } from "decimal.js";
import { UserDetailsResponse } from "./../../interfaces/responses/user-detail-response";
import { Response, NextFunction } from "express";
import { eq } from "drizzle-orm";
import { db } from "../../db/setup";
import { users } from "../../db/schema/users";
import { emails } from "../../db/schema/emails";
import { SuccessResponse } from "../../core/api-response";
import createLogger from "../../utils/logger";
import { ProtectedRequest } from "types/app-requests";
import "dotenv/config";
import { AuthFailureError } from "core/api-error";

const logger = createLogger("get-user-details-controller");

type User = typeof users.$inferInsert;
type VerifiedEmail = typeof emails.$inferInsert;

export const handleGetUserDetails = async (
  req: ProtectedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.user!;
    logger.info("Fetching user details", { userId: id });

    const authorisedUser = await db.query.users.findFirst({
      where: eq(users.id, id),
      with: {
        operator: true,
        ticketer: {
          with: {
            bus: {
              with: { operators: true },
            },
          },
        },
      },
    });

    if (!authorisedUser) {
      logger.warn("Unauthorized access attempt", { userId: id });
      throw new AuthFailureError(
        "INVALID_CREDENTIALS",
        "Please enter the correct password"
      );
    }

    logger.info("User details fetched successfully", { userId: id });

    const userDetails: UserDetailsResponse = {
      email: authorisedUser.email,
      role: authorisedUser.role!,
      firstName: authorisedUser.firstName!,
      lastName: authorisedUser.lastName!,
      creditBalance: new Decimal(authorisedUser.creditBalance!),
      qrCode: authorisedUser.qrCode,
      ticketerDetails:
        authorisedUser.ticketer && authorisedUser.ticketer.bus
          ? {
              tradeName: authorisedUser.ticketer.bus.operators?.tradeName!,
              activeSession: null, // TODO: Implement active session logic
            }
          : null,
    };

    return new SuccessResponse(
      "SUCCESS",
      "User details fetched",
      userDetails
    ).send(res);
  } catch (error) {
    logger.error("Error fetching user details", { error });
    next(error);
  }
};
