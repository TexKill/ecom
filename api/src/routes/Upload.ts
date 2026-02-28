import express, { Request, Response } from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

const router = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "ecom-products",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  } as any,
});

const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      cb(new Error("Invalid file type. Only jpg, jpeg, png, webp are allowed"));
      return;
    }
    cb(null, true);
  },
});

router.post("/", (req: Request, res: Response) => {
  upload.single("image")(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        res.status(400).json({ message: err.message });
        return;
      }
      if (err instanceof Error && err.message.includes("Invalid file type")) {
        res.status(400).json({ message: err.message });
        return;
      }
      res.status(500).json({ message: "Upload failed" });
      return;
    }
    if (!req.file) {
      res.status(400).json({ message: "No file uploaded" });
      return;
    }
    res.json({ url: (req.file as any).path });
  });
});

export default router;
