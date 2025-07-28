import { v2 as cloudinary } from 'cloudinary';
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'online-wedding-invitation-img-upload',
    allowed_formats: ['jpg', 'png', 'jpeg'],
  }
});

export const upload = multer({ storage });
