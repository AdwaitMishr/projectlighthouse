import express from 'express'
import cors from 'cors'
import { sql } from './db';
import cookieParser from "cookie-parser"
import { toNodeHandler } from 'better-auth/node';

const app = express();

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    next();
});

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

app.get('/', async (_, res) => {
  try {
    const response = await sql`SELECT version()`;
    const row = response[0] as {version: string} | undefined;
    if(!row) return res.status(500).json({error: "No version returned from the database"})
  
    res.json({ version: row.version });

    console.log("DB CONNECTED", row.version);
    
  } catch (error) {
    console.error('Error connecting the db to the server')
  }
});



const now = new Date();

app.get('/ready', async(_ , res) => {
    try {
        const response = await sql`SELECT 1`; //ping the db 
        return res.status(200).json({
            status: "ok",
            db: "connected",
            server: "running",
            timestamp: new Date().toISOString()
        })
    } catch (error) {
        return res.status(500).json({
            status: "error",
            db: "not connected",
            server: "db connection failed",
            timestamp: new Date().toISOString()
        })
    }
})

export { app }

