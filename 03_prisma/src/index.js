import express from "express"
import prismaClient from "./config/prisma-client.config.js"

const app = express()

app.use(express.json())




app.listen(3000, () => {
    console.log("server is running on port 3000")
})