import { Request, Response, NextFunction } from "express";
import { db } from "../../db/setup";
import { users } from "../../db/schema/users";
import { emails } from "../../db/schema/emails";
import { SuccessResponse } from "../../core/api-response";
import createLogger from "../../utils/logger";
import "dotenv/config";
import TwoFactorAuthManager from "../../helpers/two-factor-auth-manager";

const logger = createLogger("user-controller");

type User = typeof users.$inferInsert;
type VerifiedEmail = typeof emails.$inferInsert;

export const handleVerifyEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, otp } = req.body;

  try {
    await TwoFactorAuthManager.handleVerifyOTP(email, otp);
    const verifiedEmail: VerifiedEmail = {
      email,
    };
    console.log(verifiedEmail);

    const response = await db.insert(emails).values(verifiedEmail).returning();

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
    next(error);
  }
};