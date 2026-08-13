import express from "express"
import { redis } from "./config/redis.js"


export const app = express()

app.use(express.json())

// topics to cover in redis
// crud operations using redis
// hashing -- user profile 
// otp verification
// rate limiting
// pub/sub => real time chat application/fintech apps
// redlock => distributed lock


app.get("/health",async (req,res) => {
     const reply = await redis.ping()
     return res.json({reply})
})

// create a entry in redis => key,value
app.post("/create", async (req,res)=> {
   const {key,value} = req.body
   await redis.set(key,value)
   return res.json({message: "Entry created successfully"})
})

// get a entry from redis => key
app.get("/get/:key",async (req,res) => {
     const {key} = req.params;
     const value = await redis.get(key)
     return res.json({value})
})

// delete a entry from redis => key
app.delete("/delete/:key",async (req,res) => {
     const {key} = req.params;
     await redis.del(key)
     return res.json({message: "Entry deleted successfully"})
})

// update a entry in redis => key,value
app.put("/update/:key",async (req,res) => {
   const {key} = req.params
   const {value} = req.body
   await redis.set(key,value)
   return res.json({message: "Entry updated successfully"})
})


 
app.listen(5000, () => {
    console.log("Server is running on port 5000")
})

