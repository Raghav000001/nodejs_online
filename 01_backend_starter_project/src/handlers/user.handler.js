import User from "../schemas/user.schema.js";
import { ApiResponse } from "../utilities/response.js";
import StatusCodes from "http-status-codes";
import {logger} from "../config/logger.config.js"
 

 export  const registerUser = async (req,res)=> {
     await User.create(req.body)
    return res.json(new ApiResponse(StatusCodes.CREATED,req.body,"user registered successfully"))
}

export const getUsers = async (req,res) => {
    logger.info("got the users")
   const users = await User.find({})
   return res.json(new ApiResponse(StatusCodes.OK,users,"users fetched successfully"))  
}

