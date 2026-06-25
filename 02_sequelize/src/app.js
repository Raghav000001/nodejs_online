import e from "express"
import path from "path"
import { fileURLToPath } from "url"
import v1Router from "./router/v1/index.js"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export const app = e()

app.use(e.json({ limit: "16kb" }))
app.use("/public", e.static(path.join(__dirname, "../public")))

app.use("/api/v1", v1Router)


// seeders => to push some dummy data into our databse so we can play around the db

// users => 3 columns => name,age,email => father's name  => dec 2026 (father's name - remove)


// https://sequelize.org/docs/v7/cli/0