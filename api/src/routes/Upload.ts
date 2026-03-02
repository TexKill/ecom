import express, { Request, Response } from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

const router = express.Router();

/* ================================
   Cloudinary Config
================================ */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/* ================================
   Multer Memory Storage
================================ */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

/* ================================
   Route
================================ */
router.post(
  "/",
  upload.single("image"),
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "ecom-products" },
        (error, result) => {
          if (error || !result) {
            return res.status(500).json({ message: "Upload failed" });
          }

          return res.status(200).json({
            message: "Upload successful",
            url: result.secure_url,
          });
        },
      );

      streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  },
);

export default router;
