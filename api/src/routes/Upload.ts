import express, { Response } from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";
import asyncHandler from "express-async-handler";
import { protect } from "../middleware/Auth";
import { admin } from "../middleware/Admin";
import { AuthRequest } from "../types/auth";
import { env } from "../config/env";
import { createRateLimit } from "../middleware/RateLimit";

const router = express.Router();
const uploadRateLimit = createRateLimit({
  bucket: "upload",
  windowMs: env.UPLOAD_RATE_LIMIT_WINDOW_MS,
  maxRequests: env.UPLOAD_RATE_LIMIT_MAX_REQUESTS,
  message: "Too many upload requests. Please try again later.",
});

/* ================================
   Cloudinary Config
================================ */
cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

/* ================================
   Multer Memory Storage
================================ */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowedMimeTypes = new Set([
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ]);
    if (!allowedMimeTypes.has(file.mimetype)) {
      const error = new Error("Only JPG, JPEG, PNG, and WEBP images are allowed") as Error & {
        statusCode?: number;
      };
      error.statusCode = 400;
      return cb(error);
    }
    cb(null, true);
  },
});

/* ================================
   Route
================================ */
router.post(
  "/",
  uploadRateLimit,
  protect,
  admin,
  upload.single("image"),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.file) {
      res.status(400);
      throw new Error("No file uploaded");
    }
    const file = req.file;

    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "ecom-products",
          resource_type: "image",
        },
        (error, uploadedResult) => {
          if (error || !uploadedResult) {
            reject(error ?? new Error("Upload failed"));
            return;
          }
          resolve(uploadedResult as { secure_url: string });
        },
      );

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });

    res.status(200).json({
      message: "Upload successful",
      url: result.secure_url,
    });
  }),
);

export default router;
