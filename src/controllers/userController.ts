import { Request, Response, NextFunction } from "express";
import { eq, count } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { db } from "../db/setup";
import { users } from "../db/schema/users";
import { emails } from "../db/schema/emails";
import { BadRequestError } from "../core/apiError";
import { CreatedMsgResponse, SuccessMsgResponse } from "../core/apiResponse";
import generateId from "../utils/idGenerator";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import * as EmailValidator from "email-validator";
import { Address } from "nodemailer/lib/mailer";
import { SuccessResponse } from "../core/apiResponse";
import createLogger from "../utils/logger";
import { ProtectedRequest } from "types/app-requests";
import * as OTPAuth from "otpauth";
import "dotenv/config";
import TwoFactorAuthManager from "../helpers/TwoFactorAuthManager";

const logger = createLogger("user-controller");

type User = typeof users.$inferInsert;
type VerifiedEmail = typeof emails.$inferInsert;

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const generateTerminal = (current: number): string => {
  const prefix = "T";
  const charLength = 8;
  return generateId(prefix, charLength, current);
};

const dispatchVerificationEmail = (email: Address[]) => {
  const verificationToken = jwt.sign(
    { email },
    process.env.VERIFY_TOKEN_SECRET!,
    {
      expiresIn: "1h",
    }
  );

  const verificationLink = `${process.env.BASE_URL}/v1.0/user/email/verify?token=${verificationToken}`;
  const mailOptions = {
    from: `"BusPay" <${process.env.EMAIL_USERNAME}>`,
    to: email,
    subject: "Welcome to BusPay",
    text: `Click on the following link to verify your email: ${verificationLink}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(`Unable to send verification email: ${error.message}`);
    }
  });
};

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

export const handleCreateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const uuid = req.query.uuid?.toString();
  const { firstName, lastName, email, password, role } = req.body;
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(password.toString(), salt);
  try {
    const verifiedEmail = await db.query.emails.findFirst({
      where: eq(emails.id, uuid!),
    });

    if (verifiedEmail) {
      if (verifiedEmail.email === email) {
        const existingUser = await db.query.users.findFirst({
          where: eq(users.email, verifiedEmail.email),
        });

        if (existingUser) {
          throw new BadRequestError(
            "EMAIL_ALREADY_EXISTS",
            "Email already in use"
          );
        }
        const terminal = await db
          .select({ count: count() })
          .from(users)
          .then((data) => generateTerminal(data[0].count + 1));

        const newUser: User = {
          terminal,
          firstName,
          lastName,
          email,
          passwordHash: hashedPassword,
          role,
          creditBalance: 0,
          isActive: true,
          isIncomplete: false,
        };

        await db.insert(users).values(newUser);
      } else {
        throw new BadRequestError(
          "EMAIL_NOT_VERIFIED",
          "Email is not verified"
        );
      }
    } else {
      throw new BadRequestError("INVALID_UUID", "Invalid verification uuid");
    }

    return new CreatedMsgResponse(
      "USER_CREATED",
      "User created successfully"
    ).send(res);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

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
