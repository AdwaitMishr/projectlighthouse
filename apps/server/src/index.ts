import dotenv from 'dotenv'
import path from 'path'
import './utils/redis/redisClient.ts'

dotenv.config({
  path: path.resolve(__dirname, "../../../.env"),
});


import { app } from './app'

dotenv.config({
    path: './env'
})

const PORT = process.env.PORT;

app.listen(PORT, () => {
    console.log(`Server running at PORT: ${PORT}`)
})






