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
  firstName: string;
  lastName: string;
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
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw httpError(400, "User already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const name = `${firstName} ${lastName}`.trim();
  const user = await prisma.user.create({
    data: {
      id: generateDbId(),
      firstName,
      lastName,
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
  payload: {
    firstName?: string;
    lastName?: string;
    name?: string;
    email?: string;
    currentPassword?: string;
    password?: string;
  },
): Promise<AuthUserResponse> => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw httpError(404, "User not found");
  }

  if (payload.password) {
    const isCurrentPasswordValid = await bcrypt.compare(
      payload.currentPassword || "",
      user.password,
    );
    if (!isCurrentPasswordValid) {
      throw httpError(400, "Current password is incorrect");
    }
  }

  const nameParts = payload.name?.trim().split(/\s+/).filter(Boolean) || [];
  const firstName = payload.firstName ?? nameParts[0] ?? user.firstName;
  const lastName =
    payload.lastName ??
    (nameParts.length > 1 ? nameParts.slice(1).join(" ") : undefined) ??
    user.lastName;
  const name = `${firstName} ${lastName}`.trim();

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      firstName,
      lastName,
      name,
      email: payload.email || user.email,
      ...(payload.password
        ? { password: await bcrypt.hash(payload.password, 10) }
        : {}),
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
