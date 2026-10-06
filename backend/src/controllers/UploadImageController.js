import { fromNodeHeaders } from "better-auth/node";

import { auth } from "../lib/auth.js";
import { uploadImageCloude } from "../cloudinary/cloudinary.js";

export const uploadProfileImage = async (req, res) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session) {
      return res.status(401).json({
        success: false,
        message: "Please login first.",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please select an image.",
      });
    }

    const uploadResult = await uploadImageCloude(req.file);

    const { error } = await auth.api.updateUser({
      headers: fromNodeHeaders(req.headers),
      body: {
        image: uploadResult.secure_url,
      },
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message || "Failed to update profile image.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile picture updated successfully.",
      data: {
        image: uploadResult.secure_url,
      },
    });
  } catch (error) {
    console.error("Profile image upload error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong.",
    });
  }
};