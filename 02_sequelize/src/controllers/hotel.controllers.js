import { createHotelService, getHotelByidService, uploadHotelImageService } from "../services/hotel.services.js"


export const createHotelController = async (req,res) => {
      console.log(req.body);
      
      const {name,address,city,state,zip,country,phone,email} = req.body
      const hotel = await createHotelService({name,address,city,state,zip,country,phone,email})
      return res.status(201).json(hotel)
}

export const getHotelByidController = async (req,res) => {
   const {id} = req.params
   const hotel = await getHotelByidService(id)
   return res.status(200).json(hotel)
}



export const uploadHotelImageController = async (req, res) => {
  const { id } = req.params

  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" })
  }

  const result = await uploadHotelImageService(id, req.file.path)

  if (result.error === "Image upload to Cloudinary failed") {
    return res.status(500).json({ message: result.error })
  }

  if (result.error === "Hotel not found") {
    return res.status(404).json({ message: result.error })
  }

  return res.status(200).json({ message: "Image uploaded successfully", hotel: result })
}

// home work => update hotel and delete hotel 