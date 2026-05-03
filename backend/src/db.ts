import { Pool, neonConfig } from '@neondatabase/serverless'
import ws from 'ws'
import dotenv from 'dotenv'
dotenv.config()

neonConfig.webSocketConstructor = ws

export const pool = new Pool({ connectionString: process.env.DATABASE_URL })
