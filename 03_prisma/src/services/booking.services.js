import {
  createBooking,
  createIdempotencyKey,
  getIdempotencyKeyWithLock,
  finalizeIdempotencyKey,
  confirmBooking,
} from "../repositories/booking.repositories.js";
import { generateKey } from "../utils/index.js";
import PrismaClient from "../config/prisma-client.config.js";

export const createBookingService = async ({
  userId,
  hotelId,
  totalGuests,
  bookingAmount,
  idempotencykey,
}) => {
  const booking = await createBooking({
    userId,
    hotelId,
    totalGuests,
    bookingAmount,
    idempotencykey,
  });
  const key = generateKey();
  const idempotencykey = await createIdempotencyKey({
    key,
    bookingId: booking.id,
  });
  return {
    bookingId: booking.id,
    idempotencykey: idempotencykey.key,
  };
};

export const finalizeBookingService = async (idempotencykeyId) => {
  return await PrismaClient.$transaction(async (txn) => {

    const idempotencykey = await getIdempotencyKeyWithLock(txn,idempotencykeyId);
     if (!idempotencykey) {
        throw new Error("Idempotency key not found");
     }

    if (idempotencykey.finalized) {
      throw new Error("Idempotency key is already finalized");
    }

    const booking = await confirmBooking(txn,idempotencykey.bookingId)
    const finalizedIdempotencykey = await finalizeIdempotencyKey(txn,idempotencykeyId);
    return booking
  });
};
