import { Request, Response, NextFunction } from "express";
import { eq, count } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { db } from "../db/setup";
import { rolesEnum, users } from "../db/schema/users";
import { BadRequestError } from "../core/apiError";
import { CreatedMsgResponse } from "../core/apiResponse";
import generateId from "../utils/idGenerator";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import * as EmailValidator from "email-validator";

type NewUser = typeof users.$inferInsert;

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

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
    if (!EmailValidator.validate(email)) {
      throw new BadRequestError("INVALID_EMAIL", "Use a valid email address");
    }
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
      isIncomplete: false,
    };
    const verificationToken = jwt.sign(
      { email },
      process.env.VERIFY_TOKEN_SECRET!,
      {
        expiresIn: "1h",
      }
    );
    await db.insert(users).values(newUser);
    const verificationLink = `${process.env.BASE_URL}/verify-email?token=${verificationToken}`;
    const mailOptions = {
      from: process.env.EMAIL_USERNAME,
      to: email,
      subject: "Welcome to BusPay",
      text: `Click on the following link to verify your email: ${verificationLink}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(`Unable to send verification email: ${error.message}`);
      }
    });
    return new CreatedMsgResponse(
      "USER_CREATED",
      "User created successfully"
    ).send(res);
  } catch (error) {
    console.log(error);
    next(error);
  }
};
