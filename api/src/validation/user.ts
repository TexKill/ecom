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
    firstName: z.string().trim().min(2).max(50).optional(),
    lastName: z.string().trim().min(2).max(50).optional(),
    name: z.string().trim().min(2).max(100).optional(),
    email: z.string().trim().email().optional(),
    currentPassword: z.string().min(1).optional(),
    password: z.string().min(6).max(128).optional(),
  })
  .refine(
    (data) =>
      Boolean(
        data.firstName ||
          data.lastName ||
          data.name ||
          data.email ||
          data.password,
      ),
    {
    message: "At least one field is required",
    path: ["body"],
    },
  )
  .refine((data) => !data.password || Boolean(data.currentPassword), {
    message: "Current password is required",
    path: ["currentPassword"],
  });
