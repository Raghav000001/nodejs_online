import { redis } from "../config/redis.js";
import { app } from "../index.js";
import { generateOTP, otpKey } from "../utils/index.js";

// send the otp to user
app.post("/send-otp",async (req,res)=> {
    const {email} = req.body
    const otp = generateOTP()
    // logic to send email -- await sendEmail(email,otp)
    await redis.set(otpKey(email),otp,"EX",60) //60 seconds
    return res.json({message: "otp sent successfully"})
})  


// verify the otp
app.post("/verify-otp",async (req,res)=> {
    const {email,otp} = req.body
    const storedKey = await redis.get(otpKey(email))
    if (storedKey !== otp) {
        return res.json({message:"otp is invalid or expired"})
    } 
    await redis.del(otpKey(email))
    return res.json({message:"otp verified successfully"})
})

app.get("/get-ttl/:email",async (req,res)=> {
    const {email} = req.params
    const ttl = await redis.ttl(otpKey(email))
    return res.json({ttl})
})


// ttl --> time to live    