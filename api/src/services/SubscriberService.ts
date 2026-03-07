import { Subscriber } from "../models/Subscriber";
import { httpError } from "../utils/httpError";

export const subscribeEmail = async (emailRaw: string): Promise<void> => {
  const email = String(emailRaw).trim().toLowerCase();
  const exists = await Subscriber.findOne({ email }).lean();
  if (exists) {
    throw httpError(409, "Email is already subscribed");
  }
  await Subscriber.create({ email });
};

