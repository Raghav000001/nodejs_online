import e from "express"
import v1Router from "./router/v1/index.js"


export const app = e()

app.use("/api/v1",v1Router)


// seeders => to push some dummy data into our databse so we can play around the db

// users => 3 columns => name,age,email => father's name  => dec 2026 (father's name - remove)


// https://sequelize.org/docs/v7/cli/