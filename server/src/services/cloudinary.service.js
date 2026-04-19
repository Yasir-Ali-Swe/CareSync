import streamifier from "streamifier";
import cloudinary from "../config/cloudinary.js";

const uploadBuffer = (buffer, options = {}) =>
  new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });

export const cloudinaryService = {
  async uploadImage(buffer, folder = "caresync/images") {
    return uploadBuffer(buffer, {
      folder,
      resource_type: "image",
    });
  },

  async uploadFile(buffer, folder = "caresync/files") {
    return uploadBuffer(buffer, {
      folder,
      resource_type: "auto",
    });
  },
};
