import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { appRoles } from "../db/schema/users";
import {
  AuthFailureError,
  ForbiddenError,
  BadRequestError,
} from "../core/apiError";
import { ProtectedRequest } from "types/app-requests";
import { promisify } from "util";

// Test status: not tested

type AuthenticatedRole = (typeof appRoles)[number];

// export const getAccessToken = (authorization?: string) => {
//   if (!authorization) throw new AuthFailureError("Invalid Authorization");
//   if (!authorization.startsWith("Bearer "))
//     throw new AuthFailureError("Invalid Authorization");
//   return authorization.split(" ")[1];
// };

export const authorize = (roles: AuthenticatedRole[]) => {
  return (req: ProtectedRequest, res: Response, next: NextFunction) => {
    const authorization = req.headers.authorization;
    console.log(authorization);
    if (!authorization)
      throw new AuthFailureError(
        "AUTHORIZATION_REQUIRED",
        "Auth token not found for this request"
      );
    if (!authorization.trim().startsWith("Bearer ")) {
      throw new AuthFailureError("INVALID_TOKEN", "Your auth token is invalid");
    }

    const token = authorization?.split(" ")[1];
    console.log(token);

    try {
      jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET!,
        (err, decodedToken) => {
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
          console.log(decodedToken);
          const {
            userInfo: { email, role },
          } = decodedToken as {
            userInfo: { email: string; role: string };
          };
          console.log(role);

          if (!roles.includes(role as AuthenticatedRole)) {
            throw new ForbiddenError(
              "USER_UNAUTHORIZED",
              "You don't have permission to access this endpoint"
            );
          }

          req.user = {
            email,
            role,
          };

          next();
        }
      );
    } catch (error) {
      next(error);
    }
  };
};
