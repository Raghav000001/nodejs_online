import mongoose from 'mongoose'
import { serverConfig } from './index.js'


export async function connectDB() {
      try {
        const connectionInstance =  await mongoose.connect(`${serverConfig.mongodbUri}/${serverConfig.dbName}`)
        if (connectionInstance) {
            console.log('connected to mongodb', connectionInstance.connection.host)
        }  
      } catch (error) {
          console.log(error)
          process.exit(1)
      }
}
