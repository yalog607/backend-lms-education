import { v2 as cloudinary } from "cloudinary"
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import "dotenv/config"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'yalina_elearning',
    resource_type: 'auto',
    allowed_formats: ['jpg', 'png', 'jpeg', 'pdf', 'mp4', 'mov', 'avi', 'mkv'],
    chunk_size: 6000000
  },
});

export const uploadCloud = multer({ storage });