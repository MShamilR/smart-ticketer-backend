import { NextFunction, Response } from "express";
import { ProtectedRequest } from "types/app-requests";
import { db } from "../../db/setup";
import { eq } from "drizzle-orm";
import { users } from "../../db/schema/users";
import { buses } from "../../db/schema/buses";
import { BadRequestError } from "../../core/api-error";
import { SuccessResponse } from "../../core/api-response";
import createLogger from "../../utils/logger";

const logger = createLogger("register-bus-controller");

type Bus = typeof buses.$inferInsert;

export const handleRegisterBus = async (
  req: ProtectedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.user!;
    const { registrationPlate, routeId } = req.body;

    logger.info("Bus registration request received", {
      email,
      registrationPlate,
      routeId,
    });

    if (!registrationPlate || !routeId) {
      throw new BadRequestError(
        "NOT_PROVIDED",
        "Please provide all required data"
      );
    }

    const authorisedUser = await db.query.users.findFirst({
      where: eq(users.email, email),
      with: {
        operator: true,
      },
    });

    const operatorId = authorisedUser?.operatorId!;
    logger.info("Registering bus under operator", { operatorId, email });

    const newBus: Bus = {
      operatorId,
      registrationPlate,
      routeId,
    };

    const response = await db.insert(buses).values(newBus).returning();

    logger.info("Bus successfully registered", {
      busId: response[0].id,
      operatorId,
      registrationPlate,
    });

    return new SuccessResponse("SUCCESS", "Bus added to your fleet", {
      id: response[0].id,
      operator: authorisedUser?.operator?.tradeName,
      registrationPlate: response[0].registrationPlate,
    }).send(res);
  } catch (error) {
    logger.error("Error registering bus", {  error });
    next(error);
  }
};
