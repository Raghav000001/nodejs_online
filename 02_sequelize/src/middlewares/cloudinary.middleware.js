import { cloudinary } from "../config/cloudinary.js"
import fs from "fs"

export async function uploadToCloudinary(localPath) {
  try {
    if (!localPath) return null

    const response = await cloudinary.uploader.upload(localPath, {
      resource_type: "auto",
    })

    console.log("Cloudinary upload success:", response.url)
    fs.unlinkSync(localPath)

    return response
  } catch (error) {
    console.error("Cloudinary upload failed:", error.message)

    if (fs.existsSync(localPath)) {
      fs.unlinkSync(localPath)
    }

    return null
  }
}
