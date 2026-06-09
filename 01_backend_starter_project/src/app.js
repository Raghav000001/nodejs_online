import { attachCoRelationId } from './middlewares/co-relationid.middleware.js'
import express from 'express'
import cors from 'cors'
import { serverConfig } from './config/index.js'

export const app = express()

app.use(attachCoRelationId)

app.use(
    cors({
        origin: serverConfig.corsOrigin,
    })
)


app.use(express.json({ limit: '16kb' }))
app.use(express.urlencoded({ extended: true }))


import V1Router from './routes/v1/index.js'

app.use('/api/v1',V1Router)


// request => hit => routing , validation layer , controller layer 
// cron jobs => we can run a particular piece of code at any given time period
// req hit => code encounter req object => corelation id generate => req...
// code => encounter nahi kar raha hamare req.. obj sath (background jobs)


// asyncLocalStorage => create a storage , put corelation id in that storage, get corelation id from that storage