import dotenv from "dotenv"
   
   function loadEnv (){
      return dotenv.config()
   }


   loadEnv()


   export const serverConfig = {
            port: process.env.PORT || 3000,  
   }

   export const dbConfig = {
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      port: process.env.DB_PORT,
      host: process.env.DB_HOST,
      dialect: process.env.DB_DIALECT,
   }