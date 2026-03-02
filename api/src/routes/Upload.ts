import express, { Request, Response } from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
const multerStorageCloudinary = require("multer-storage-cloudinary");

const router = express.Router();

/* ================================
   Cloudinary config
================================ */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/* ================================
   Storage
================================ */
const storage = multerStorageCloudinary({
  cloudinary: cloudinary,
  folder: "ecom-products",
  allowedFormats: ["jpg", "jpeg", "png", "webp"],
});

/* ================================
   Multer
================================ */
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

/* ================================
   Route
================================ */
router.post("/", upload.single("image"), (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  return res.status(200).json({
    message: "Upload successful",
    url: (req.file as any).path,
  });
});

export default router;
