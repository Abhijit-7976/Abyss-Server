import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

export const uploadToCloudinary = async (localFilePath: string) => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
    api_key: process.env.CLOUDINARY_API_KEY!,
    api_secret: process.env.CLOUDINARY_API_SECRET!,
  });

  try {
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
      upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET,
    });

    fs.unlinkSync(localFilePath);
    return response;
  } catch (err) {
    fs.unlinkSync(localFilePath);
    console.log("❗ Failed to upload file to Cloudinary");
    throw err;
  }
};

export const deleteFromCloudinary = async (publicIds: string[]) => {
  try {
    const response = await cloudinary.api.delete_resources(publicIds);
    return response;
  } catch (err) {
    console.log("❗ Failed to delete from Cloudinary");
    throw err;
  }
};
