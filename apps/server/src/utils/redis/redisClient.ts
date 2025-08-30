import { createClient } from 'redis';

const redisConnectionString = process.env.REDIS_CONNECTION_URL || '';


const redisClient = createClient({
    url : redisConnectionString
})

redisClient.on('connect', () => {
    console.log('Connecting to redis ');
})

redisClient.on('ready', () => {
    console.log('Redis connected successfully')
})

redisClient.on('error', (err) => {
    console.log('Error connecting with redis',err)
});

(async () => {
    try{
        await redisClient.connect();
    }catch(err){
        console.error('Failed to connect to redis', err)
    }
})()

export default redisClient;