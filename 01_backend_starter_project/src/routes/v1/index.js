import { Router } from "express";
import { userRoutes } from "./user.routes.js";

const V1Router = Router()

V1Router.use("/user",userRoutes)

export default V1Router
