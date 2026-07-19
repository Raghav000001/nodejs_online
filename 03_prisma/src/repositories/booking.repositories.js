

import { prismaClient } from "../config/prisma-client.config.js";


async function createBooking(bookingData) {
    const booking = await prismaClient.booking.create({bookingData})
    return booking
}

async function getBookingById(id) {
    const booking = await prismaClient.booking.findUnique({
        where: {id}
    })
    return booking
}


