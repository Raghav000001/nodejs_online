import express from 'express'
import cors from 'cors'
import { serverConfig } from './config/index.js'

export const app = express()

app.use(
    cors({
        origin: serverConfig.corsOrigin,
    })
)



app.use(express.json({ limit: '16kb' }))
app.use(express.urlencoded({ extended: true }))


import V1Router from './routes/v1/index.js'

app.use('/api/v1',V1Router)

