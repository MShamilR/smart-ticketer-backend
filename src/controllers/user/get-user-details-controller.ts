import { Request, Response, NextFunction } from "express";
import { eq } from "drizzle-orm";
import { db } from "../../db/setup";
import { users } from "../../db/schema/users";
import { emails } from "../../db/schema/emails";
import { SuccessResponse } from "../../core/api-response";
import createLogger from "../../utils/logger";
import { ProtectedRequest } from "types/app-requests";
import "dotenv/config";

const logger = createLogger("user-controller");

type User = typeof users.$inferInsert;
type VerifiedEmail = typeof emails.$inferInsert;

export const handleGetUserDetails = async (
  req: ProtectedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
  } catch (error) {
    const { id } = req.user!;

    const authorisedUser = await db.query.users.findFirst({
      where: eq(users.id, id),
      with: {
        operator: true,
        ticketer: true,
      },
    });

    return new SuccessResponse(
      "SUCCESS",
      "User details fetched",
      authorisedUser
    ).send(res);
  }
};
