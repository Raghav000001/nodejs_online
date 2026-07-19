import express from "express"
import prismaClientConfig from "./config/prisma-client.config.js"

const app = express()


app.post("/booking", async (req, res) => {
    const {userId, hotelId, totalGuests} = req.body
     const booking = await prismaClient.booking.create({userId, hotelId, totalGuests})
    res.json({message: "Booking created successfully"})
})




app.listen(3000, () => {
    console.log("server is running on port 3000")
})