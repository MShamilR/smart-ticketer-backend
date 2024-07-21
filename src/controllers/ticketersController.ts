import { NextFunction, Request, Response } from "express";
import { ProtectedRequest } from "types/app-requests";
import { db } from "../db/setup";
import { eq } from "drizzle-orm";
import { users } from "../db/schema/users";
import { BadRequestError } from "../core/apiError";
import { SuccessMsgResponse } from "../core/apiResponse";
import { invites } from "db/schema/invites";

type NewInvite = typeof invites.$inferInsert;

export const handleInviteTicketers = async (
  req: ProtectedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.user!; // decoded from token
    const { inviteeId } = req.body; //single user per request

    const authorisedUser = await db.query.users.findFirst({
      where: eq(users.id, id),
      with: {
        operator: true,
      },
    });

    const operatorId = authorisedUser?.operatorId;

    const newInvite: NewInvite = {
      operatorId,
      userId: inviteeId,
      isAccepted: false,
    };

    await db.insert(invites).values(newInvite);
    return new SuccessMsgResponse(
      "TICKETER_INVITED",
      "Ticketer invitation has been sent to user"
    ).send(res);
  } catch (error) {
    next(error);
  }
};
