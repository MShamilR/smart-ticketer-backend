import { Request, Response, NextFunction } from "express";
import { eq, count } from "drizzle-orm";
import { db } from "../../db/setup";
import { users } from "../../db/schema/users";
import { emails } from "../../db/schema/emails";
import { BadRequestError } from "../../core/api-error";
import { CreatedMsgResponse } from "../../core/api-response";
import generateId from "../../utils/id-generator";
import bcrypt from "bcryptjs";
import createLogger from "../../utils/logger";
import "dotenv/config";
import { nanoid } from "nanoid";

const logger = createLogger("create-user-controller");

type User = typeof users.$inferInsert;

const generateTerminal = (current: number): string => {
  const prefix = "T";
  const charLength = 8;
  return generateId(prefix, charLength, current);
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
          qrCode: nanoid(10),
          passwordHash: hashedPassword,
          role,
          creditBalance: "0.00",
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
