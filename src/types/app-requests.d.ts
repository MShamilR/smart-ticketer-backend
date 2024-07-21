import { Request } from "express";

interface User {
  id: number;
  email: string;
  role: string;
}

export interface ProtectedRequest extends Request {
  user?: User;
}
