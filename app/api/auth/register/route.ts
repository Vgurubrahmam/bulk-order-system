import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import type { User } from "@/lib/types"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await sql`
      SELECT * FROM users WHERE email = ${email}
    `

    if (existingUser.length) {
      return NextResponse.json({ error: "User already exists" }, { status: 409 })
    }

    // In a real app, you would hash the password here
    // For simplicity, we're storing it as plain text
    const user = await sql`
      INSERT INTO users (name, email, password, role)
      VALUES (${name}, ${email}, ${password}, 'buyer')
      RETURNING id, name, email, role
    `
    const cookieStore = await cookies()
    cookieStore.set("userId", user[0].id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    })

    return NextResponse.json(user[0], { status: 201 })
  } catch (error) {
    console.error("Error registering user:", error)
    return NextResponse.json({ error: "Failed to register user" }, { status: 500 })
  }
}
