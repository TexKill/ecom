import { z } from "zod";

export const registerSchema = z.object({
  firstName: z.string().trim().min(2).max(50),
  lastName: z.string().trim().min(2).max(50),
  email: z.string().trim().email(),
  password: z.string().min(6).max(128),
});

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export const updateProfileSchema = z
  .object({
    name: z.string().trim().min(2).max(100).optional(),
    email: z.string().trim().email().optional(),
    password: z.string().min(6).max(128).optional(),
  })
  .refine((data) => Boolean(data.name || data.email || data.password), {
    message: "At least one field is required",
    path: ["body"],
  });
