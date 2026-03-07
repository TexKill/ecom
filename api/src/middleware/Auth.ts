import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import { Response, NextFunction } from "express";
import { AuthRequest } from "../types/auth";
import { User } from "../models/User";
import { IUser } from "../types";
import { env } from "../config/env";

interface JwtPayload {
  id: string;
}

export const protect = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    let token: string | undefined;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      try {
        token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

        req.user = (await User.findById(decoded.id).select(
          "-password",
        )) as IUser;
        next();
      } catch (err) {
        res.status(401);
        throw new Error("Not authorized, token failed");
      }
    }

    if (!token) {
      res.status(401);
      throw new Error("Not authorized, no token");
    }
  },
);
