'use server'
import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import type { User } from "@/lib/types"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }
    const cookieStore = await cookies()
    const user = await sql`
      SELECT id, name, email, role FROM users 
      WHERE email = ${email} AND password = ${password}
    ` as User[]

    if (!user.length) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Set a cookie to keep the user logged in
    cookieStore.set("userId", user[0].id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    })

    return NextResponse.json(user[0])
  } catch (error) {
    console.error("Error logging in:", error)
    return NextResponse.json({ error: "Failed to log in" }, { status: 500 })
  }
}
