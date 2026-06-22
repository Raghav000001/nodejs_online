import {v2 as cloudinary} from "cloudinary"
import { cloudinaryConfig } from "../config/index.js"


 export const cloudinaryCloud = () => {
     cloudinary.config({
        cloud_name:cloudinaryConfig.cloud_name,
        api_key:cloudinaryConfig.api_key,
        api_secret:cloudinaryConfig.api_secret,
     })
}




