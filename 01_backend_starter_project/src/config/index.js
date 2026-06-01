import dotenv from "dotenv"

export function loadEnv(){
  return dotenv.config()
}


loadEnv()


export const serverConfig = {
    port:process.env.PORT,
    corsOrigin:process.env.CORS_ORIGIN,
    mongodbUri:process.env.MONGODB_URI,
    dbName:process.env.DB_NAME
}
    
