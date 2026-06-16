
import {Router} from "express"
import hotelRouter from "./hotel.router.js"

const v1Router = Router()

v1Router.use("/hotels",hotelRouter)

export default v1Router