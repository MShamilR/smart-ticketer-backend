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
import { BadRequestError } from "../core/apiError";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

type OTPLog = typeof otpLogs.$inferInsert;

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
      // Todo: implement a table to insert and update secret and related otp
      let totp = new OTPAuth.TOTP({
        digits: this.digits,
        period: this.expiry,
        secret: OTPAuth.Secret.fromBase32(this.secret!),
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
            "OTP_LIMIT_EXCEED",
            "You have exceeded the otp limit"
          );
        }
      } else {
        const newOTPLog: OTPLog = {
          email,
        };
        await db.insert(otpLogs).values(newOTPLog);
      }

      let code = totp.generate();
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
}
