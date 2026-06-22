import { cloudinaryCloud } from "../config/cloudinary.js";
import fs from "fs"


export async function uploadFile(localPath) {
    try {
        if (!localPath) return null   // custom error message
         const response = await cloudinaryCloud.uploader.upload(localPath,{
             resource_type:"auto"
         })
         console.log("file:",response.url);
         return response
    } catch (error) {
        // if file is not uploaded then remove it from the local storage
        fs.unlinkSync(localPath)
        return null
    }
}



// delete = > unlink