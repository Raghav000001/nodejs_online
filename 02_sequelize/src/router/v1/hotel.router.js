import {Router} from "express"
import { createHotelController, getHotelByidController } from "../../controllers/hotel.controllers.js"
const hotelROuter = Router()

hotelROuter.post("/",createHotelController)
hotelROuter.get("/:id",getHotelByidController)

export default hotelROuter