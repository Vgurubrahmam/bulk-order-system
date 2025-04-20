import { neon } from "@neondatabase/serverless"

// Create a SQL client with the connection string from environment variables
const sql = neon(process.env.DATABASE_URL!)

export { sql }
