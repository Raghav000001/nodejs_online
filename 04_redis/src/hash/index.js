import { app } from "..";
import { redis } from "../config/redis.js";


// create a new user Profile
app.post("/user/create",async (req,res)=> {
     const {id,name,email,password} = req.body
     await redis.hset(`user:${id}`,{
        name,
        email,
        password
     })
     return res.json({message: "user created successfully"})
})

// get a user profile 
app.get("/user/:id",async (req,res)=> {
     const {id} = req.params
     const user = await redis.hgetall(`user:${id}`)
     return res.json({user})
})

// update a user profile 
app.put("/user/update/:id",async (req,res)=> {
     const {id} = req.params
     const {name,email,password} = req.body
     await redis.hset(`user:${id}`,{
        name,
        email,
        password
     })
     return res.json({message: "user updated successfully"})
})

// delete a user profile 
app.delete("/user/delete/:id",async (req,res)=> {
     const {id} = req.params
     await redis.del(`user:${id}`)
     return res.json({message: "user deleted successfully"})
})