import { v2 as cloudinary } from 'cloudinary';
import { ENV } from './env.config';

const cloudName = ENV.CLOUD_NAME;
const apiKey = ENV.CLOUD_API_KEY;
const apiSecret = ENV.CLOUD_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  throw new Error('Cloudinary environment variables are missing');
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
});

export default cloudinary;
