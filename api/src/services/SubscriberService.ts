import { prisma } from "../db/commerce";
import { httpError } from "../utils/httpError";
import { generateDbId } from "../utils/ids";

export const subscribeEmail = async (emailRaw: string): Promise<void> => {
  const email = String(emailRaw).trim().toLowerCase();
  const exists = await prisma.subscriber.findUnique({ where: { email } });
  if (exists) {
    throw httpError(409, "Email is already subscribed");
  }
  await prisma.subscriber.create({
    data: {
      id: generateDbId(),
      email,
    },
  });
};
