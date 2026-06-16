import { createHotel,getHotelByid } from "../repositories/hotel.repositories.js"


    export const createHotelService = async ({name,address,city,state,zip,country,phone,email}) => {
               const hotel = await createHotel({name,address,city,state,zip,country,phone,email})
               return hotel
    }

    export const getHotelByidService = async (id) => {
        const hotel = await getHotelByid(id)
        return hotel
    }