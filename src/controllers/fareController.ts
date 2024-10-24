import { Request, Response, NextFunction } from "express";
import { ProtectedRequest } from "types/app-requests";

export const handleCalculateFare = async (
  req: ProtectedRequest,
  res: Response,
  next: NextFunction
) => {};
