import express from "express";

import { uploadProfileImage } from "../controllers/UploadImageController.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.put(
  "/profile-image",
  upload.single("image"),
  uploadProfileImage
);

export default router;