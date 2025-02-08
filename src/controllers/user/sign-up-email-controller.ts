import { Request, Response, NextFunction } from "express";
import { eq, count } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { db } from "../../db/setup";
import { users } from "../../db/schema/users";
import { emails } from "../../db/schema/emails";
import { BadRequestError } from "../../core/api-error";
import {
  SuccessMsgResponse,
} from "../../core/api-response";
import * as EmailValidator from "email-validator";
import createLogger from "../../utils/logger";
import "dotenv/config";
import TwoFactorAuthManager from "../../helpers/two-factor-auth-manager";

const logger = createLogger("user-controller");

type User = typeof users.$inferInsert;
type VerifiedEmail = typeof emails.$inferInsert;

export const handleSignUpEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email } = req.body;
  logger.info("Received sign-up request", { email });
  try {
    if (!EmailValidator.validate(email)) {
      logger.warn("Invalid email address provided", { email });
      throw new BadRequestError("INVALID_EMAIL", "Use a valid email address");
    }

    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUser) {
      logger.warn("Email already in use", { email });
      throw new BadRequestError("EMAIL_ALREADY_EXISTS", "Email already in use");
    }

    // TEST
    TwoFactorAuthManager.dispatchEmail(email);

    // dispatchVerificationEmail(email);
    logger.info("Verification email dispatched", { email });

    return new SuccessMsgResponse(
      "VERIFICATION_LINK_DISPATCHED",
      "Click on the link to proceed"
    ).send(res);
  } catch (error: any) {
    logger.error("Unable to validate email ", {
      error,
      email,
    });
    next(error);
  }
};