import bcrypt from "bcryptjs";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";
import { db } from "../db/setup";
import { users } from "../db/schema/users";
import { BadRequestError, AuthFailureError } from "../core/apiError";
import { SuccessResponse } from "core/apiResponse";
import "dotenv/config";

const handleSignIn = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password } = req.body;
  if (!email || !password)
    throw new BadRequestError(
      "EMPTY_CREDENTIALS",
      "Username and password are required"
    );
  const matchedUser = await db.query.users.findFirst({
    where: eq(users.email, email),
  });
  if (!matchedUser) {
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
          email: matchedUser.email,
          role: matchedUser.role,
        },
      },
      process.env.ACCESS_TOKEN_SECRET!,
      { expiresIn: "30s" }
    );
    const refreshToken = jwt.sign(
      { email: matchedUser.email },
      process.env.REFRESH_TOKEN_SECRET!,
      { expiresIn: "1d" }
    );
    // Saving refreshToken with current user
    await db
      .update(users)
      .set({ refreshToken })
      .where(eq(users.email, matchedUser.email));
    new SuccessResponse("LOGIN_SUCCESS", "User logged in Successfully", {
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
};
