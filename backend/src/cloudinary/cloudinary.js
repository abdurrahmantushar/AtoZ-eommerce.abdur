import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

export const uploadImageCloude = async (image) => {
  const buffer =
    image?.buffer ||
    Buffer.from(await image.arrayBuffer());

  const uploadImage = await new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: "Abdur",
          resource_type: "auto",
        },
        (error, uploadResult) => {
          if (error) {
            return reject(error);
          }

          resolve(uploadResult);
        }
      )
      .end(buffer);
  });

  return uploadImage;
};

export const deleteImageCloude = async (imageUrl) => {
  try {
    if (!imageUrl) return;

    const uploadPart = imageUrl.split("/upload/")[1];

    if (!uploadPart) return;

    const pathWithoutVersion = uploadPart.replace(
      /^v\d+\//,
      ""
    );

    const publicId = pathWithoutVersion.replace(
      /\.[^/.]+$/,
      ""
    );

    if (!publicId) return;

    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error(
      "Cloudinary delete error:",
      error.message
    );
  }
};