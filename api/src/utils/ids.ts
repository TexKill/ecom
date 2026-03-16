import { Types } from "mongoose";

export const generateDbId = () => new Types.ObjectId().toHexString();
