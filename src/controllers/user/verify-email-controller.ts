import { Request, Response, NextFunction } from "express";
import { db } from "../../db/setup";
import { users } from "../../db/schema/users";
import { emails } from "../../db/schema/emails";
import { SuccessResponse } from "../../core/api-response";
import createLogger from "../../utils/logger";
import "dotenv/config";
import TwoFactorAuthManager from "../../helpers/two-factor-auth-manager";

const logger = createLogger("verify-email-controller");

type User = typeof users.$inferInsert;
type VerifiedEmail = typeof emails.$inferInsert;

export const handleVerifyEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, otp } = req.body;

  try {
    logger.info("Received email verification request", { email });
    await TwoFactorAuthManager.handleVerifyOTP(email, otp);
    logger.info("OTP verification successful", { email });

    const verifiedEmail: VerifiedEmail = {
      email,
    };

    logger.info("Inserting verified email into database", { email });
    const response = await db.insert(emails).values(verifiedEmail).returning();
    logger.info("Email successfully inserted", { email, uuid: response[0].id });

    new SuccessResponse(
      "EMAIL_VERIFIED",
      "Fill missing details to register account",
      {
        verified: true,
        uuid: response[0].id,
        email: response[0].email,
      }
    ).send(res);
  } catch (error) {
    logger.error("Error verifying email", { email, error });
    next(error);
  }
};
