import { v4 as uuidv4 } from "uuid";
import { asyncLocalStore } from "../utilities/asyncLocalStorage.js";


    export function attachCoRelationId (req,res,next) {
          const coRelationId = uuidv4()
          console.log(coRelationId);
           req.headers["co-relation-id"] = coRelationId
            asyncLocalStore.run({coRelationID: coRelationId},()=> {
                next()
            })        
    }