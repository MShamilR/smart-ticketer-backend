import { NextFunction, Response } from "express";
import { ProtectedRequest } from "../../types/app-requests";
import { db } from "../../db/setup";
import { eq } from "drizzle-orm";
import { ticketers } from "../../db/schema/ticketers";
import { fares } from "../../db/schema/fares";
import { SuccessResponse } from "../../core/api-response";

export const handleGetFareList = async (
  req: ProtectedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.user!;
    const foundTicketer = await db.query.ticketers.findFirst({
      where: eq(ticketers.userId, id),
      with: {
        bus: {
          with: { routes: true },
        },
      },
    });

    const route = foundTicketer?.bus?.routeId!;
    const stops = foundTicketer?.bus?.routes?.stops!;

    const fareAmounts = await db.select().from(fares).limit(stops);

    return new SuccessResponse("SUCCESS", `Fare list for route ${route}`, {
      fareAmounts,
    }).send(res);
  } catch (error) {
    next(error);
  }
};
