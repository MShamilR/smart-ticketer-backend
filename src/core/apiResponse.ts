import { Response } from "express";

// Helper code for the API consumer to understand the error and handle is accordingly
enum StatusCode {
  SUCCESS = "10000",
  FAILURE = "10001",
  RETRY = "10002",
  INVALID_ACCESS_TOKEN = "10003",
}

enum ResponseStatus {
  SUCCESS = 200,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  INTERNAL_ERROR = 500,
}

abstract class ApiResponse {
  constructor(
    protected status: ResponseStatus, // http status code
    protected code: string,
    protected message: string // protected timestamp: Date
  ) {}

  protected prepare<T extends ApiResponse>(
    res: Response,
    response: T,
    headers: { [key: string]: string }
  ): Response {
    for (const [key, value] of Object.entries(headers)) res.append(key, value);
    return res.status(this.status).json(ApiResponse.sanitize(response));
  }

  public send(
    res: Response,
    headers: { [key: string]: string } = {}
  ): Response {
    return this.prepare<ApiResponse>(res, this, headers);
  }

  private static sanitize<T extends ApiResponse>(response: T): T {
    const clone: T = {} as T;
    Object.assign(clone, response);
    // @ts-ignore
    delete clone.status;
    for (const i in clone) if (typeof clone[i] === "undefined") delete clone[i];
    return clone;
  }
}

export class AuthFailureResponse extends ApiResponse {
  constructor(code: string, message = "Authentication Failure") {
    super(ResponseStatus.UNAUTHORIZED, code, message);
  }
}

export class NotFoundResponse extends ApiResponse {
  constructor(code: string, message = "Not Found") {
    super(ResponseStatus.NOT_FOUND, code, message);
  }

  send(res: Response, headers: { [key: string]: string } = {}): Response {
    return super.prepare<NotFoundResponse>(res, this, headers);
  }
}

export class ForbiddenResponse extends ApiResponse {
  constructor(code: string, message = "Forbidden") {
    super(ResponseStatus.FORBIDDEN, code, message);
  }
}

export class BadRequestResponse extends ApiResponse {
  constructor(code: string, message = "Bad Parameters") {
    super(ResponseStatus.BAD_REQUEST, code, message);
  }
}

export class InternalErrorResponse extends ApiResponse {
  constructor(code: string, message = "Internal Error") {
    super(ResponseStatus.INTERNAL_ERROR, code, message);
  }
}

export class SuccessMsgResponse extends ApiResponse {
  constructor(code: string, message: string) {
    super(ResponseStatus.SUCCESS, code, message);
  }
}

export class FailureMsgResponse extends ApiResponse {
  constructor(code: string, message: string) {
    super(ResponseStatus.SUCCESS, code, message);
  }
}

export class SuccessResponse<T> extends ApiResponse {
  constructor(code: string, message: string, private data: T) {
    super(ResponseStatus.SUCCESS, code, message);
  }

  send(res: Response, headers: { [key: string]: string } = {}): Response {
    return super.prepare<SuccessResponse<T>>(res, this, headers);
  }
}

export class AccessTokenErrorResponse extends ApiResponse {
  private instruction = "refresh_token";

  constructor(code: string, message = "Access token invalid") {
    super(ResponseStatus.UNAUTHORIZED, code, message);
  }

  send(res: Response, headers: { [key: string]: string } = {}): Response {
    headers.instruction = this.instruction;
    return super.prepare<AccessTokenErrorResponse>(res, this, headers);
  }
}

export class TokenRefreshResponse extends ApiResponse {
  constructor(
    message: string,
    code: string,
    private accessToken: string,
    private refreshToken: string
  ) {
    super(ResponseStatus.SUCCESS, code, message);
  }

  send(res: Response, headers: { [key: string]: string } = {}): Response {
    return super.prepare<TokenRefreshResponse>(res, this, headers);
  }
}
