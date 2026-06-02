import * as z from "zod";
   

export const userRegisterValidator = z.object({
  name:z.string().min(3).max(20),
  email:z.string().email(),
  password:z.string().min(6).max(20)
})


export const loginUserValidator = z.object({
    email:z.email(),
    password:z.string().min(6).max(20)
})

// {req.body,schema fields}
// req.body => zod -- parse(req.body) -- parsed req.body => req object