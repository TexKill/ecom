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
    if (!req.headers.authorization?.startsWith("Bearer")) {
      res.status(401);
      throw new Error("Not authorized, no token");
    }

    const token = req.headers.authorization.split(" ")[1];

    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

      const user = await User.findById(decoded.id).select("-password");
      if (!user) {
        res.status(401);
        throw new Error("Not authorized, user not found");
      }

      req.user = user as IUser;
      next();
    } catch (err) {
      res.status(401);
      throw new Error("Not authorized, token failed");
    }
  },
);
