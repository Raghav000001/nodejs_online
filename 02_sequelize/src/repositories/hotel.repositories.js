import Hotel from "../db/models/hotel.modal.js";



  export async function createHotel({name,address,city,state,zip,country,phone,email}) {
     const hotel = await Hotel.create({
          name,
          address,
          city,
          state,
          zip,
          country,
          phone,
          email
       })
       return hotel
  }

  export async function getHotelByid(id) {
      const hotel = await Hotel.findByPk(id)
      return hotel
  }
  

  export async function getAllHotels() {
    const hotels = await Hotel.findAll()
    return hotels
  }

  export async function deleteHotel(id) {
     const hotel = await Hotel.findByPk(id)
     await hotel.destroy()
     return hotel
  }

 export async function hardDelete(id) {
    const hotel = await Hotel.findByPk(id,{paranoid:false})
    await hotel.destroy()
    return {message:"Hotel permanently deleted"}
 }

 export async function restoreHotel(id) {
     const hotel = await Hotel.findByPk(id,{paranoid:false})
     const restoredHotel = await hotel.restore()
     return restoredHotel
 }

    // gallery - delete  => trash (21 days) - ttl (time to live  - redis) => automatically hard delete

  // api test, soft delete and recover deleted hotels api's
  // 1. soft delete
  // 2. soft deleted items recover
  // 3. har delete 


  // image upload
  // auto delete => background job set up
