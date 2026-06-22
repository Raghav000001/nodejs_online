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

   export const cloudinaryConfig = {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
   }