import express from "express";
import { getSiteSettings, updateSiteSettings } from "../controllers/SiteSettingController.js";
import requireAdmin from "../lib/requireAdmin.js";


const router = express.Router();

router.get("/",requireAdmin, getSiteSettings);
router.put("/",requireAdmin, updateSiteSettings);

export default router;