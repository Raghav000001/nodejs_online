import Redis from "ioredis"

export const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379")

redis.on("connect",()=> {
     console.log("connectd to redis server ...");
     
})

redis.on("error",(err)=> {
     console.log(err);
     
})