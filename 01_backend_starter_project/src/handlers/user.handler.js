import User from "../schemas/user.schema.js";
import { ApiResponse } from "../utilities/response.js";
import StatusCodes from "http-status-codes";


 export  const registerUser = async (req,res)=> {
     await User.create(req.body)
    return res.json(new ApiResponse(StatusCodes.CREATED,req.body,"user registered successfully"))
}


