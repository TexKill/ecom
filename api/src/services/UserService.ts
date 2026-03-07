import { User } from "../models/User";
import generateToken from "../utils/tokenGenerate";
import { httpError } from "../utils/httpError";

type AuthUserResponse = {
  _id: unknown;
  name: string;
  email: string;
  isAdmin: boolean;
  token: string;
  createdAt: Date;
};

type ProfileResponse = {
  _id: unknown;
  name: string;
  email: string;
  isAdmin: boolean;
  createdAt: Date;
};

const toAuthResponse = (user: {
  _id: any;
  name: string;
  email: string;
  isAdmin: boolean;
  createdAt: Date;
}) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  isAdmin: user.isAdmin,
  token: generateToken(user._id),
  createdAt: user.createdAt,
});

export const loginUser = async (
  email: string,
  password: string,
): Promise<AuthUserResponse> => {
  const user = await User.findOne({ email });
  if (!user || !(await user.matchPassword(password))) {
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
  const existing = await User.findOne({ email }).lean();
  if (existing) {
    throw httpError(400, "User already exists");
  }

  const user = await User.create({ name, email, password });
  if (!user) {
    throw httpError(400, "Invalid user data");
  }

  return toAuthResponse(user);
};

export const getUserProfile = async (userId: string): Promise<ProfileResponse> => {
  const user = await User.findById(userId);
  if (!user) {
    throw httpError(404, "User not found");
  }

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    isAdmin: user.isAdmin,
    createdAt: user.createdAt,
  };
};

export const updateUserProfile = async (
  userId: string,
  payload: { name?: string; email?: string; password?: string },
): Promise<AuthUserResponse> => {
  const user = await User.findById(userId);
  if (!user) {
    throw httpError(404, "User not found");
  }

  user.name = payload.name || user.name;
  user.email = payload.email || user.email;
  if (payload.password) {
    user.password = payload.password;
  }

  const updatedUser = await user.save();
  return toAuthResponse(updatedUser);
};

export const refreshUserSession = async (userId: string): Promise<AuthUserResponse> => {
  const user = await User.findById(userId);
  if (!user) {
    throw httpError(404, "User not found");
  }

  return toAuthResponse(user);
};

