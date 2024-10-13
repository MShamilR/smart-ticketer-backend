import { NextFunction, Request, Response } from "express";
import { ProtectedRequest } from "types/app-requests";
import { db } from "../db/setup";
import { eq } from "drizzle-orm";
import { users } from "../db/schema/users";
import { buses } from "../db/schema/buses";
import { BadRequestError } from "../core/apiError";
import { SuccessResponse } from "../core/apiResponse";

type Bus = typeof buses.$inferInsert;

export const handleRegisterBus = async (
  req: ProtectedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.user!;
    const { registrationPlate, routeNo, stops } = req.body;
    if (!registrationPlate || !routeNo || !stops) {
      throw new BadRequestError(
        "NOT_PROVIDED",
        "Please provide all required data"
      );
    }

    // Revisit code
    const authorisedUser = await db.query.users.findFirst({
      where: eq(users.email, email),
      with: {
        operator: true,
      },
    });

    const userId = authorisedUser?.id;
    const operatorId = authorisedUser?.operatorId;

    const newBus: Bus = {
      userId,
      operatorId,
      registrationPlate,
      routeNo,
      stops,
    };

    const response = await db.insert(buses).values(newBus).returning();
    console.log(response);
    return new SuccessResponse("BUS_ADDED", "Bus added to your fleet", {
      id: response[0].id,
      operator: authorisedUser?.operator?.tradeName,
      registrationPlate: response[0].registrationPlate,
      routeNo: response[0].routeNo,
      stops: response[0].stops,
    }).send(res);
  } catch (error) {
    next(error);
  }
};
