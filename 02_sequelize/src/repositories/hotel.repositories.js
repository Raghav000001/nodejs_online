import Hotel from "../db/models/hotel.modal.js";



  export async function createHotel({name,address,city,state,zip,country,phone,email}) {
     const hotel =  Hotel.create({
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
      const hotel = Hotel.findByPk(id)
      return hotel
  }
  