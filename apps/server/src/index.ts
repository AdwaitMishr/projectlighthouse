import dotenv from 'dotenv'
import path from 'path'

dotenv.config({
  path: path.resolve(__dirname, "../../../.env"),
});

import './utils/redis/redisClient.ts'

import { app } from './app'

dotenv.config({
    path: './env'
})

const PORT = process.env.PORT;

app.listen(PORT, () => {
    console.log(`Server running at PORT: ${PORT}`)
})






