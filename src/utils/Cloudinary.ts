import { v2 as cloudinary } from 'cloudinary';
import { API_KEY, API_SECRET, CLOUD_APP_NAME, CLOUD_NAME } from './Constants';

cloudinary.config({
  cloud_name: CLOUD_NAME,
  api_key: API_KEY,
  api_secret: API_SECRET,
});
export const uploadPhotoToCloudinary = async (photo: Blob) => {
  return new Promise<string>((resolve, reject) => {

    photo.arrayBuffer()
      .then((buffer) => {
        const bufferObj = Buffer.from(buffer);
        cloudinary.uploader.upload_stream(
          { folder: CLOUD_APP_NAME },
          (error, result) => {
            if (error) {
              console.error('Cloudinary upload error:', error);
              reject(new Error('Failed to upload photo to Cloudinary'));
            } else {
              //@ts-expect-error: result might be undefined 
              resolve(result.secure_url);
            }
          }
        ).end(bufferObj);
      })
      .catch((error) => {
        if (error instanceof Error) {
          reject(new Error('Error converting photo to buffer'));
        }
      });
  });
};

export const uploadVideoToCloudinary = async (video: Blob): Promise<string> => {

  const MAX_MB = 50;
  if (video.size > MAX_MB * 1024 * 1024) {
    throw new Error(`Video too large: max is ${MAX_MB} MB.`);
  }
  const buffer = Buffer.from(await video.arrayBuffer());
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        { folder: CLOUD_APP_NAME, resource_type: 'video' },
        (error, result) => {
          if (error) return reject(new Error('Failed to upload video'));
          resolve(result!.secure_url);
        }
      )
      .end(buffer);
  });
};




