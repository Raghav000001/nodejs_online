import winston from "winston"
import DailyRotateFile from "winston-daily-rotate-file"
import { getCoRelationID } from "../utilities/asyncLocalStorage.js"

export const logger = winston.createLogger({
    // format , transporter
    format: winston.format.combine(
           winston.format.timestamp({format:'YYYY-MM-DD HH:mm:ss'}),
           winston.format.json(),
           winston.format.printf(({timestamp,level,message,coRelationId,...data})=> {
               const output = {
                     timestamp,
                     level,
                     message,
                     coRelationId:getCoRelationID(),
                     ...data
               }
               return JSON.stringify(output)
           })
    ),
    transports: [
        new winston.transports.Console(),
        new DailyRotateFile({
             dirname:"./logs",
             filename:"%DATE%.log",
             datePattern:"YYYY-MM-DD",
             maxFiles:"14d",
             zippedArchive:true,
             maxsize:"20m",
        }) ,
        // todo : write a logic to save these logs in mongodb
        
    ]
})



// format : log dikhai kaisa dega 
// transport : kahan store hoga (console, file (winstonDailyRotateFile), todo :database (mongodb))