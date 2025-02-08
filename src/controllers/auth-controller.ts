import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";
import { db } from "../db/setup";
import { Roles, users } from "../db/schema/users";
import { BadRequestError, AuthFailureError } from "../core/api-error";
import { SuccessResponse } from "../core/api-response";
import bcrypt from "bcryptjs";
import "dotenv/config";
import SignInRequest from "interfaces/requests/sign-in-request";
import createLogger from "../utils/logger";

const logger = createLogger("auth-controller");

export const handleSignIn = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = <SignInRequest>req.body;
    if (!email || !password)
      throw new BadRequestError(
        "EMPTY_CREDENTIALS",
        "Username and password are required"
      );
    const matchedUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });
    if (!matchedUser) {
      logger.error("No user registered", {
        email,
      });
      throw new BadRequestError(
        "USER_NOT_FOUND",
        "No user is registered with the provided email"
      );
    }
    // evaluate password
    const match = await bcrypt.compare(password, matchedUser.passwordHash);
    if (match) {
      // create JWTs
      const accessToken = jwt.sign(
        {
          userInfo: {
            id: matchedUser.id,
            email: matchedUser.email,
            role: matchedUser.role,
          },
        },
        process.env.ACCESS_TOKEN_SECRET!,
        { expiresIn: "1d" }
      );
      const refreshToken = jwt.sign(
        { email: matchedUser.email },
        process.env.REFRESH_TOKEN_SECRET!,
        { expiresIn: "1d" }
      );
      await db
        .update(users)
        .set({ refreshToken })
        .where(eq(users.email, matchedUser.email));
      // handle incomplete for role OPERATOR if no user is assigned
      new SuccessResponse("SIGNIN_SUCCESS", "User signed in successfully", {
        user: matchedUser.email,
        accessToken,
        refreshToken,
      }).send(res);
    } else {
      throw new AuthFailureError(
        "INVALID_CREDENTIALS",
        "Please enter the correct password"
      );
    }
  } catch (error) {
    next(error);
  }
};

export const handleRefreshToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
  } catch (error) {}
};
