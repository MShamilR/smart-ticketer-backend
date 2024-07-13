import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { appRoles } from "db/schema/users";
import {
  AuthFailureError,
  ForbiddenError,
  BadRequestError,
} from "core/apiError";
import { ProtectedRequest } from "types/app-requests";

// Test status: not tested

type AuthenticatedRole = (typeof appRoles)[number];

export const authorize = (roles: AuthenticatedRole[]) => {
  return (req: ProtectedRequest, res: Response, next: NextFunction) => {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) {
      throw new BadRequestError(
        "AUTHORIZATION_REQUIRED",
        "Auth token not found for this request"
      );
    }

    try {
      jwt.verify(
        token,
        process.env.VERIFY_TOKEN_SECRET!,
        async (err, decodedToken) => {
          if (err) {
            if (err.name === "TokenExpiredError") {
              throw new AuthFailureError(
                "EXPIRED_TOKEN",
                "Your auth token has expired"
              );
            } else {
              throw new AuthFailureError(
                "INVALID_TOKEN",
                "Your auth token is invalid"
              );
            }
          }

          const decoded = decodedToken as { email: string; role: string };

          if (!roles.includes(decoded.role as AuthenticatedRole)) {
            throw new ForbiddenError(
              "USER_UNAUTHORIZED",
              "You don't have permission to access this endpoint"
            );
          }

          req.user = {
            email: decoded.email,
            role: decoded.role,
          };

          next();
        }
      );
    } catch (error) {
      next(error);
    }
  };
};
