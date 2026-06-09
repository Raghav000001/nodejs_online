import { app } from './app.js'
import { connectDB } from './config/db.config.js'
import { serverConfig } from './config/index.js'
import mongoose from 'mongoose'
import { logger } from './config/logger.config.js'

// mongoose
//     .connect(`${serverConfig.mongodbUri}/${serverConfig.dbName}`)
//     .then(() => {
//         console.log('connected to mongodb', )
//     })
//     .then(() => {
//         app.listen(serverConfig.port, () => {
//             console.log(`app is running on port : ${serverConfig.port}`)
//         })
//     })
//     .catch((err) => {
//         console.log(err)
//     })

   connectDB()
   .then(()=> {
             app.listen(serverConfig.port, () => {
             logger.info({message:`app is running on port : ${serverConfig.port}`},{data:"data"})
              //  levels : error, warn, info, debug
            })
   }).catch((err) => {
    logger.error(err)
   })


   // log => error - logger.error()
   



