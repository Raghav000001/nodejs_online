import { createHotel, getHotelByid, updateHotelImage } from "../repositories/hotel.repositories.js"
import { uploadToCloudinary } from "../middlewares/cloudinary.middleware.js"


    export const createHotelService = async ({name,address,city,state,zip,country,phone,email}) => {
               const hotel = await createHotel({name,address,city,state,zip,country,phone,email})
               return hotel
    }

    export const getHotelByidService = async (id) => {
        const hotel = await getHotelByid(id)
        return hotel
    }

    export const uploadHotelImageService = async (id, localPath) => {
      const cloudinaryResponse = await uploadToCloudinary(localPath)
      if (!cloudinaryResponse) return { error: "Image upload to Cloudinary failed" }

      const hotel = await updateHotelImage(id, cloudinaryResponse.url)
      if (!hotel) return { error: "Hotel not found" }

      return hotel
    }