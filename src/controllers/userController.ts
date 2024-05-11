import { TokenExpiredError } from "./../core/apiError";
import bcrypt from "bcryptjs";
import { Request, Response, NextFunction } from "express";
import { eq, count } from "drizzle-orm";
import { db } from "../db/setup";
import { rolesEnum, users } from "../db/schema/users";
import { BadRequestError } from "../core/apiError";
import { CreatedMsgResponse } from "../core/apiResponse";
import generateId from "../utils/idGenerator";

type NewUser = typeof users.$inferInsert;

const generateToken = (current: number): string => {
  const prefix = "T";
  const charLength = 8;
  return generateId(prefix, charLength, current);
};

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

    const token = await db
      .select({ count: count() })
      .from(users)
      .then((data) => generateToken(data[0].count + 1));

    const newUser: NewUser = {
      token,
      firstName,
      lastName,
      email,
      passwordHash: hashedPassword,
      role,
      creditBalance: 0,
      isActive: true,
    };
    await db.insert(users).values(newUser);
    return new CreatedMsgResponse(
      "USER_CREATED",
      "User created successfully"
    ).send(res);
  } catch (error) {
    console.log(error);
    next(error);
  }
};
