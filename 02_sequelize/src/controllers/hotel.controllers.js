import { createHotelService,getHotelByidService } from "../services/hotel.services.js"


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



// home work => update hotel and delete hotel 