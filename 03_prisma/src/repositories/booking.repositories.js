
import PrismaClient from "../config/prisma-client.config.js"

// create booking
   export const createBooking = async ({userId,hotelId,totalGuests,bookingAmount,idempotencykey}) => {
         const booking = await PrismaClient.Booking.create({
            data:{
                userId,
                hotelId,
                totalGuests,
                bookingAmount,
                idempotencykey
            }
         })

         return booking
   }



// create idempotency key
  export const createIdempotencyKey = async ({key,bookingId}) => {
     const idempotencykey = await PrismaClient.idempotencykey.create({
         data:{
            key,
            booking:{
                 connect:{
                    id:bookingId
                 }
            }
         }
     })
     return idempotencykey
}


// get booking by id
 export const getBookingById = async (bookingId) => {
    const booking = await PrismaClient.Booking.findUnique({
        where:{
            id:bookingId
        }
    })
    return booking
 }

// get idempotencykey by id
export const getIdempotencyKeyById = async (idempotencykeyId) => {
    const idempotencykey = await PrismaClient.idempotencykey.findUnique({
        where:{
            id:idempotencykeyId
        }
    })
    return idempotencykey
 }


// confirm booking
export const confirmBooking = async (bookingId) => {
    const booking = await PrismaClient.booking.update({
         where:{
            id:bookingId
         },
         data:{
            status:"CONFIRMED"
         }
    })
    return booking
}


// cancel booking 
export const cancelBooking = async (bookingId) => {
    const booking = await PrismaClient.booking.update({
         where:{
            id:bookingId
         },
         data:{
            status:"CANCELLED"
         }
    })
    return booking
}



// finalize idempotency key
export const finalizeIdempotencyKey = async (idempotencykeyId) => {
   const idempotency = await PrismaClient.idempotencykey.update({
        where:{
             id:idempotencykeyId
        },
        data:{
            finalized:true
        }
   })
   return idempotency
}




