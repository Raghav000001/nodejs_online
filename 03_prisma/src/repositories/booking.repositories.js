
import PrismaClient from "../config/prisma-client.config.js"
import { validate as uuidValidate } from 'uuid';


// create booking
   export const createBooking = async ({userId,hotelId,totalGuests,bookingAmount,idempotencykey}) => {
         const booking = await PrismaClient.booking.create({
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
     const idempotencykey = await PrismaClient.idempotencyKey.create({
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
    const booking = await PrismaClient.booking.findUnique({
        where:{
            id:bookingId
        }
    })
    return booking
 }

// get idempotencykey by id
export const getIdempotencyKeyWithLock = async (txn,idempotencykeyId) => {

   if(!uuidValidate(idempotencykeyId)){
      throw new Error("Invalid idempotency key")
   }
    const idempotencykey = await txn.$queryRaw`SELECT * FROM idempotencyKey WHERE id = ${idempotencykeyId} FOR UPDATE`

   if (!idempotencykey || idempotencykey.length === 0) {
      throw new Error("Idempotency key not found")
   }

    return idempotencykey[0]
 }


// confirm booking
export const confirmBooking = async (txn,bookingId) => {
    const booking = await txn.booking.update({
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
export const finalizeIdempotencyKey = async (txn,idempotencykeyId) => {
   const idempotency = await txn.idempotencyKey.update({
        where:{
             id:idempotencykeyId
        },
        data:{
            finalized:true
        }
   })
   return idempotency
}




