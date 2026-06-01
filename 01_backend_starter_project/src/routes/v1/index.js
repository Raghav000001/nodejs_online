import { Router } from "express";
import { authRouter } from "./auth.router.js";
import { userRouter } from "./user.routes.js";

const V1Router = Router()

V1Router.use("/auth",authRouter)
V1Router.use("/user",userRouter)



export default V1Router
