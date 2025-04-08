import { Pool } from "pg"
import { env } from "@/app/env"

if (!env.DATABASE_URL) {
  throw new Error("Please define the DATABASE_URL environment variable")
}

const pool = new Pool({
  connectionString: env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined,
})

export default pool
