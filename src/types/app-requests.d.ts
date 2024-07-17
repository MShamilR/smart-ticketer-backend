import { Request } from "express";

interface User {
  email: string;
  role: string;
}

export interface ProtectedRequest extends Request {
  user?: User;
}
