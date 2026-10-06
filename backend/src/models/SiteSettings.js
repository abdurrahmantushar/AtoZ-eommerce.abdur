import mongoose from "mongoose";

const siteSettingsSchema = new mongoose.Schema(
  {
    heroBadge: {
      type: String,
      default: "",
      trim: true,
    },
    heroLittleTitle: {
      type: String,
      default: "",
      trim: true,
    },
    heroHeadingOne: {
      type: String,
      default: "",
      trim: true,
    },
    heroHeadingTwo: {
      type: String,
      default: "",
      trim: true,
    },
    heroDescription: {
      type: String,
      default: "",
      trim: true,
    },
    heroCategoryList: {
      type: String,
      default: "",
      trim: true,
    },
    heroVideoUrl: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const SiteSettings =
  mongoose.models.SiteSettings ||
  mongoose.model("SiteSettings", siteSettingsSchema);

export default SiteSettings;