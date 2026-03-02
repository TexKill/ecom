import { Request } from "express";
import { IUser } from "./index";

export interface AuthRequest extends Request {
  user?: IUser;
}
