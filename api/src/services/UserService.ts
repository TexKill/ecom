import bcrypt from "bcryptjs";
import { prisma } from "../db/commerce";
import generateToken from "../utils/tokenGenerate";
import { httpError } from "../utils/httpError";
import { toApiUser } from "../utils/commerceSerializers";
import { generateDbId } from "../utils/ids";

type AuthUserResponse = ReturnType<typeof toApiUser> & {
  token: string;
};

type ProfileResponse = ReturnType<typeof toApiUser>;

const toAuthResponse = (user: {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  createdAt: Date;
}) => ({
  ...toApiUser(user),
  token: generateToken(user.id),
});

export const loginUser = async (
  email: string,
  password: string,
): Promise<AuthUserResponse> => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw httpError(401, "Invalid email or password");
  }
  return toAuthResponse(user);
};

export const registerUser = async (
  firstName: string,
  lastName: string,
  email: string,
  password: string,
): Promise<AuthUserResponse> => {
  const name = `${firstName} ${lastName}`.trim();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw httpError(400, "User already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      id: generateDbId(),
      name,
      email,
      password: hashedPassword,
    },
  });

  return toAuthResponse(user);
};

export const getUserProfile = async (userId: string): Promise<ProfileResponse> => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw httpError(404, "User not found");
  }

  return toApiUser(user);
};

export const updateUserProfile = async (
  userId: string,
  payload: { name?: string; email?: string; password?: string },
): Promise<AuthUserResponse> => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw httpError(404, "User not found");
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      name: payload.name || user.name,
      email: payload.email || user.email,
      ...(payload.password ? { password: await bcrypt.hash(payload.password, 10) } : {}),
    },
  });

  return toAuthResponse(updatedUser);
};

export const refreshUserSession = async (userId: string): Promise<AuthUserResponse> => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw httpError(404, "User not found");
  }

  return toAuthResponse(user);
};
