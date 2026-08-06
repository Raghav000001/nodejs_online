import { createBooking, createIdempotencyKey,getIdempotencyKeyById ,finalizeIdempotencyKey} from "../repositories/booking.repositories.js"
import { generateKey } from "../utils/index.js"

// todo: what is wrong with these service functions

// create a booking
export const createBookingService = async ({userId,hotelId,totalGuests,bookingAmount,idempotencykey}) => {
       const booking = await createBooking({userId,hotelId,totalGuests,bookingAmount,idempotencykey})
       const key = generateKey()
       const idempotencykey = await createIdempotencyKey({key,bookingId:booking.id})
       return {
            bookingId:booking.id,
            idempotencykey:idempotencykey.key
       }
    
}
    

// finalize a booking
export const finalizeIdempotencyKeyService = async (idempotencykeyId) => {
    // check if idempotency key is already finalized
    const idempotencykey = await getIdempotencyKeyById(idempotencykeyId)
    if(idempotencykey.finalized){
        throw new Error("Idempotency key is already finalized")
    }
    // finalize idempotency key
    const finalizedIdempotencykey = await finalizeIdempotencyKey(idempotencykeyId)
    return finalizedIdempotencykey
}
    
