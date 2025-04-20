'use server'
import { cookies } from "next/headers"
import { sql } from "./db"
import type { User } from "./types"

export async function getSession(): Promise<{ user: User | null }> {
  const cookieStore = await cookies()
  const userId = cookieStore.get("userId")?.value

  if (!userId) {
    return { user: null }
  }

  try {
    // Validate userId is a valid number
    const parsedUserId = Number.parseInt(userId, 10)
    if (isNaN(parsedUserId)) {
      return { user: null }
    }

    // Use parameterized query to prevent SQL injection
    const users = await sql`
      SELECT id, name, email, role 
      FROM users 
      WHERE id = ${parsedUserId}
    `

    return { user: (users[0] as User) || null }
  } catch (error) {
    console.error("Error getting session:", error)
    return { user: null }
  }
}

export async function isAdmin(): Promise<boolean> {
  const { user } = await getSession()
  return user?.role === "admin"
}