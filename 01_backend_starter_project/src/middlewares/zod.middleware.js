import { parseAsync } from "zod/v4/core";
import ApiError from "../utilities/error.js";
import StatusCodes from "http-status-codes";

export const validateRequestBody = (schema) => {
    return async (req,res,next) => {
         try {
            const parsedBody = await parseAsync(schema,req.body)
            req.body = parsedBody
            next()
         } catch (error) {
            return res.json(new ApiError(StatusCodes.BAD_REQUEST,error.issues[0].message,error.issues[0].message))
         }
    }

}


// parseAsync(schema - jo humne create kia hau,request body -- jo user send karega)