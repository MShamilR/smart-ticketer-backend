import { otps } from "../db/schema/otps";
import "dotenv/config";
import * as OTPAuth from "otpauth";
import { db } from "../db/setup";
import { otpLogs } from "../db/schema/otpLogs";
import { eq, sql } from "drizzle-orm";
import path from "path";
import Handlebars from "handlebars";
import fs from "fs";
import nodemailer from "nodemailer";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { AuthFailureError, BadRequestError } from "../core/api-error";
import { CrockfordBase32 } from "crockford-base32";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

type OTPLog = typeof otpLogs.$inferInsert;
type OTP = typeof otps.$inferInsert;

export default class TwoFactorAuthManager {
  private static secret = process.env.OTP_AUTH_SECRET;
  private static expiry = Number(process.env.OTP_AUTH_EXPIRY);
  private static digits = Number(process.env.OTP_AUTH_DIGITS);
  private static maxSent = Number(process.env.OTP_AUTH_MAX_SENT);
  private static maxInvalid = Number(process.env.OTP_AUTH_MAX_INVALID);
  private static transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  public static async dispatchEmail(email: string) {
    const secret = CrockfordBase32.encode(Buffer.from(email));
    let totp = new OTPAuth.TOTP({
      digits: this.digits,
      period: this.expiry,
      secret: OTPAuth.Secret.fromHex(secret),
    });

    const foundOTPLog = await db.query.otpLogs.findFirst({
      where: eq(otpLogs.email, email),
    });

    if (foundOTPLog) {
      if (foundOTPLog.sent < this.maxSent) {
        await db
          .update(otpLogs)
          .set({ sent: sql`${otpLogs.sent} + 1` })
          .where(eq(otpLogs.email, email));
      } else {
        throw new BadRequestError(
          "OTP_SEND_EXCEED",
          "You have exceeded the otp limit"
        );
      }
    } else {
      const newOTPLog: OTPLog = {
        email,
        sent: 1,
      };
      await db.insert(otpLogs).values(newOTPLog);
    }

    let code = totp.generate();

    const otp: OTP = {
      secret,
      email,
      otp: code,
    };

    await db.insert(otps).values(otp);

    const templatePath = path.join(
      __dirname,
      "..",
      "..",
      "templates",
      "emailVerification.hbs"
    );

    const source = fs.readFileSync(templatePath, "utf-8");
    const template = Handlebars.compile(source);

    const html = template({ code });
    const mailOptions = {
      from: `"BusPay" <${process.env.EMAIL_USERNAME}>`,
      to: email,
      subject: "Welcome to BusPay",
      html: html,
    };

    this.transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(`Unable to send verification email: ${error.message}`);
      }
    });
  }

  public static handleVerifyOTP = async (
    email: string,
    providedOTP: string
  ) => {
    const foundOTPLog = await db.query.otpLogs.findFirst({
      where: eq(otpLogs.email, email),
    });

    if (foundOTPLog!.invalid >= this.maxInvalid) {
      throw new BadRequestError(
        "OTP_INVALID_EXCEED",
        "Invalid OTP limit exceeded"
      );
    }

    const secret = CrockfordBase32.encode(Buffer.from(email));
    let totp = new OTPAuth.TOTP({
      digits: this.digits,
      period: this.expiry,
      secret: OTPAuth.Secret.fromHex(secret),
    });

    const isValid = totp.validate({ token: providedOTP });

    if (isValid === null) {
      await db
        .update(otpLogs)
        .set({ invalid: sql`${otpLogs.invalid} + 1` })
        .where(eq(otpLogs.email, email));

      throw new AuthFailureError(
        "INVALID_OTP",
        "You have entered an invalid otp"
      );
    }
  };
}
