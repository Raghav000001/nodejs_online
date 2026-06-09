import { Router } from "express";
import { getUsers, registerUser } from "../../handlers/user.handler.js";
import { validateRequestBody } from "../../middlewares/zod.middleware.js";
import { userRegisterValidator } from "../../validation/user.validator.js";

export const userRoutes = Router()

userRoutes.post("/register",validateRequestBody(userRegisterValidator),registerUser)
userRoutes.get("/",getUsers)




