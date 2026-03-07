import express, { Response } from "express";
import { AuthRequest } from "../types/auth";
import asyncHandler from "express-async-handler";
import { protect } from "../middleware/Auth";
import { validateBody } from "../middleware/Validate";
import {
  loginSchema,
  registerSchema,
  updateProfileSchema,
} from "../validation/user";
import { createRateLimit } from "../middleware/RateLimit";
import { env } from "../config/env";
import {
  getUserProfile,
  loginUser,
  refreshUserSession,
  registerUser,
  updateUserProfile,
} from "../services/UserService";

const userRoute = express.Router();
const authRateLimit = createRateLimit({
  bucket: "auth",
  windowMs: env.AUTH_RATE_LIMIT_WINDOW_MS,
  maxRequests: env.AUTH_RATE_LIMIT_MAX_REQUESTS,
  message: "Too many authentication attempts. Please try again later.",
});

// @desc  Login
// @route POST /api/users/login
userRoute.post(
  "/login",
  authRateLimit,
  validateBody(loginSchema),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { email, password } = req.body;
    const user = await loginUser(email, password);
    res.json(user);
  }),
);

// @desc  Register
// @route POST /api/users/register
userRoute.post(
  "/register",
  authRateLimit,
  validateBody(registerSchema),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { firstName, lastName, email, password } = req.body;
    const user = await registerUser(firstName, lastName, email, password);
    res.status(201).json(user);
  }),
);

// @desc  Get profile
// @route GET /api/users/profile
userRoute.get(
  "/profile",
  protect,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = await getUserProfile(req.user!._id.toString());
    res.json(user);
  }),
);

// @desc  Update profile
// @route PUT /api/users/profile
userRoute.put(
  "/profile",
  protect,
  validateBody(updateProfileSchema),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const updatedUser = await updateUserProfile(req.user!._id.toString(), req.body);
    res.json(updatedUser);
  }),
);

// @desc  Refresh session token
// @route POST /api/users/refresh
userRoute.post(
  "/refresh",
  protect,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = await refreshUserSession(req.user!._id.toString());
    res.json(user);
  }),
);

export default userRoute;
