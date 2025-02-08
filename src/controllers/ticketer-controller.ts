import { NextFunction, Request, Response } from "express";
import { ProtectedRequest } from "types/app-requests";
import { db } from "../db/setup";
import { eq } from "drizzle-orm";
import { users, Roles } from "../db/schema/users";
import { invites } from "../db/schema/invites";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "../core/api-error";
import { SuccessMsgResponse } from "../core/api-response";
import { ticketers } from "db/schema/ticketers";
import { inviteStatus } from "../db/schema/invites";

type NewInvite = typeof invites.$inferInsert;
type NewTicketer = typeof ticketers.$inferInsert;

export const handleInviteTicketer = async (
  req: ProtectedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.user!; // decoded from token
    const { inviteeId } = req.body; // single user per request

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
      status: inviteStatus.PENDING,
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

export const handleAcceptTicketer = async (
  req: ProtectedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.user!; // decoded from token
    const inviteId = Number(req.params.inviteId);
    const { inviteeId } = req.body; //single user per request

    const authorisedUser = await db.query.users.findFirst({
      where: eq(users.id, id),
      with: {
        operator: true,
      },
    });

    const foundInvite = await db.query.invites.findFirst({
      where: eq(invites.id, inviteId),
      with: { user: true },
    });

    console.log(foundInvite);

    if (!foundInvite) {
      throw new NotFoundError(
        "INVITE_NOT_FOUND",
        "No matching invitation found"
      );
    } else if (authorisedUser?.id !== foundInvite.userId) {
      throw new ForbiddenError(
        "USER_MISMATCH",
        "Invitation doesn't match authenticated user"
      );
    } else if (foundInvite.status === "ACCEPTED") {
      throw new BadRequestError(
        "ALREADY_ACCEPTED",
        "Invitation has already been accepted"
      );
    } else if (foundInvite.status === "REJECTED") {
      throw new BadRequestError(
        "ALREADY_REJECTED",
        "Invitation has already been rejected"
      );
    }

    console.log(foundInvite);

    const NewTicketer: NewTicketer = {
      operatorId: foundInvite.operatorId,
      userId: foundInvite.userId,
    };

    await db.transaction(async (tx) => {
      await tx.insert(ticketers).values(NewTicketer);
      await tx
        .update(users)
        .set({ role: Roles.TICKETER })
        .where(eq(users.id, foundInvite.userId!));
    });

    return new SuccessMsgResponse(
      "INVITATION_ACCEPTED",
      "You have now been assigned as a ticketer"
    ).send(res);
  } catch (error) {
    next(error);
  }
};
