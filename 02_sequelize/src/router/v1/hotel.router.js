import { Router } from "express"
import { createHotelController, getHotelByidController, uploadHotelImageController } from "../../controllers/hotel.controllers.js"
import { upload } from "../../middlewares/multer.middleware.js"

const hotelROuter = Router()

hotelROuter.post("/", createHotelController)
hotelROuter.get("/:id", getHotelByidController)

hotelROuter.post("/:id/image", upload.single("image"), uploadHotelImageController)

export default hotelROuter