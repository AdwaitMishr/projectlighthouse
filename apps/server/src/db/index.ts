import { neon } from "@neondatabase/serverless"

if(!process.env.DB_CONNECTION_STRING){
    throw new Error("Pleaes provide a connection string to connect the database")
}

export const sql = neon(process.env.DB_CONNECTION_STRING)

