import { NextFunction, Response } from "express";
import { ProtectedRequest } from "../../types/app-requests";
import { db } from "../../db/setup";
import { eq } from "drizzle-orm";
import { users, Roles } from "../../db/schema/users";
import { invites } from "../../db/schema/invites";
import { SuccessMsgResponse } from "../../core/api-response";
import { ticketers } from "../../db/schema/ticketers";
import { inviteStatus } from "../../db/schema/invites";

type NewInvite = typeof invites.$inferInsert;
type NewTicketer = typeof ticketers.$inferInsert;

export const handleInviteTicketer = async (
  req: ProtectedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.user!; // decoded from token
    const { inviteeId, busId } = req.body; // single user per request

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
      busId: busId,
      status: inviteStatus.PENDING,
    };

    await db.insert(invites).values(newInvite);
    return new SuccessMsgResponse(
      "SUCCESS",
      "Ticketer invitation has been sent to user"
    ).send(res);
  } catch (error) {
    next(error);
  }
};
