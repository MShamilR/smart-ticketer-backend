
import bcrypt from "bcryptjs";
import { Request, Response, NextFunction } from "express";
import { eq } from "drizzle-orm";
import { db } from "../db/setup";
import { rolesEnum, users } from "../db/schema/users";
import { BadRequestError } from "../core/apiError";
import { CreatedMsgResponse } from "../core/apiResponse";

type NewUser = typeof users.$inferInsert;

export const handleNewUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { firstName, lastName, email, password, role } = req.body;
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(password.toString(), salt);
  try {
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });
    if (existingUser) {
      throw new BadRequestError("EMAIL_ALREADY_EXISTS", "Email already in use");
    }
    const newUser: NewUser = {
      firstName,
      lastName,
      email,
      passwordHash: hashedPassword,
      role,
    };
    db.insert(users).values(newUser);
    return new CreatedMsgResponse(
      "USER_CREATED",
      "User created successfully"
    ).send(res);
  } catch (error) {
    next(error);
  }
};
