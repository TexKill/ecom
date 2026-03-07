import jwt from "jsonwebtoken";
import { Types } from "mongoose";
import { env } from "../config/env";

const generateToken = (id: Types.ObjectId): string => {
  return jwt.sign({ id }, env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

export default generateToken;
