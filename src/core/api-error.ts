import { Response } from "express";
//Check
//import { environment } from "../config";
import {
  AuthFailureResponse,
  AccessTokenErrorResponse,
  InternalErrorResponse,
  NotFoundResponse,
  BadRequestResponse,
  ForbiddenResponse,
} from "./api-response";

export enum ErrorType {
  BAD_TOKEN = "BadTokenError",
  TOKEN_EXPIRED = "TokenExpiredError",
  UNAUTHORIZED = "AuthFailureError",
  ACCESS_TOKEN = "AccessTokenError",
  INTERNAL = "InternalError",
  NOT_FOUND = "NotFoundError",
  NO_ENTRY = "NoEntryError",
  NO_DATA = "NoDataError",
  BAD_REQUEST = "BadRequestError",
  FORBIDDEN = "ForbiddenError",
}

export abstract class ApiError extends Error {
  constructor(
    public type: ErrorType,
    public code: string,
    public message: string = "error"
  ) {
    super(message);
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  public static handle(err: ApiError, res: Response): Response {
    switch (err.type) {
      case ErrorType.BAD_TOKEN:
      case ErrorType.TOKEN_EXPIRED:
      case ErrorType.UNAUTHORIZED:
        return new AuthFailureResponse(err.code, err.message).send(res);
      case ErrorType.ACCESS_TOKEN:
        return new AccessTokenErrorResponse(err.code, err.message).send(res);
      case ErrorType.INTERNAL:
        return new InternalErrorResponse(err.code, err.message).send(res);
      case ErrorType.NOT_FOUND:
      case ErrorType.NO_ENTRY:
      case ErrorType.NO_DATA:
        return new NotFoundResponse(err.code, err.message).send(res);
      case ErrorType.BAD_REQUEST:
        return new BadRequestResponse(err.code, err.message).send(res);
      case ErrorType.FORBIDDEN:
        return new ForbiddenResponse(err.code, err.message).send(res);
      default: {
        let message = err.message;
        //Check
        // Do not send failure message in production as it may send sensitive data
        //if (environment === "production") message = "Something wrong happened.";
        return new InternalErrorResponse().send(res);
      }
    }
  }
}

export class AuthFailureError extends ApiError {
  constructor(code: string, message = "Invalid Credentials") {
    super(ErrorType.UNAUTHORIZED, code, message);
  }
}

export class InternalError extends ApiError {
  constructor(code = "INTERNAL_ERROR", message = "Internal Error") {
    super(ErrorType.INTERNAL, code, message);
  }
}

export class BadRequestError extends ApiError {
  constructor(code: string, message = "Bad Request") {
    super(ErrorType.BAD_REQUEST, code, message);
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }
}

export class NotFoundError extends ApiError {
  constructor(code: string, message = "Not Found") {
    super(ErrorType.NOT_FOUND, code, message);
  }
}

export class ForbiddenError extends ApiError {
  constructor(code: string, message = "Permission denied") {
    super(ErrorType.FORBIDDEN, code, message);
  }
}

export class NoEntryError extends ApiError {
  constructor(message = "Entry don't exists") {
    super(ErrorType.NO_ENTRY, message);
  }
}

export class BadTokenError extends ApiError {
  constructor(message = "Token is not valid") {
    super(ErrorType.BAD_TOKEN, message);
  }
}

export class TokenExpiredError extends ApiError {
  constructor(message = "Token is expired") {
    super(ErrorType.TOKEN_EXPIRED, message);
  }
}

export class NoDataError extends ApiError {
  constructor(message = "No data available") {
    super(ErrorType.NO_DATA, message);
  }
}

export class AccessTokenError extends ApiError {
  constructor(message = "Invalid access token") {
    super(ErrorType.ACCESS_TOKEN, message);
  }
}
