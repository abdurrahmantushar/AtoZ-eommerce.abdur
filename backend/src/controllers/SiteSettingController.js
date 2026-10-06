import SiteSettings from "../models/SiteSettings.js";

export const getSiteSettings = async (req, res) => {
  try {
    let settings = await SiteSettings.findOne();

    if (!settings) {
      settings = await SiteSettings.create({});
    }

    return res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error("Get site settings error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateSiteSettings = async (req, res) => {
  try {
    const {
      heroBadge,
      heroLittleTitle,
      heroHeadingOne,
      heroHeadingTwo,
      heroDescription,
      heroCategoryList,
      heroVideoUrl,
    } = req.body;

    let settings = await SiteSettings.findOne();

    if (!settings) {
      settings = await SiteSettings.create({
        heroBadge,
        heroLittleTitle,
        heroHeadingOne,
        heroHeadingTwo,
        heroDescription,
        heroCategoryList,
        heroVideoUrl,
      });
    } else {
      settings.heroBadge = heroBadge ?? settings.heroBadge;
      settings.heroLittleTitle =
        heroLittleTitle ?? settings.heroLittleTitle;
      settings.heroHeadingOne =
        heroHeadingOne ?? settings.heroHeadingOne;
      settings.heroHeadingTwo =
        heroHeadingTwo ?? settings.heroHeadingTwo;
      settings.heroDescription =
        heroDescription ?? settings.heroDescription;
      settings.heroCategoryList =
        heroCategoryList ?? settings.heroCategoryList;
      settings.heroVideoUrl =
        heroVideoUrl ?? settings.heroVideoUrl;

      await settings.save();
    }

    return res.status(200).json({
      success: true,
      message: "Site settings updated successfully.",
      data: settings,
    });
  } catch (error) {
    console.error("Update site settings error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};