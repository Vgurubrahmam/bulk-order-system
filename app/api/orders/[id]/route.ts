import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getSession, isAdmin } from "@/lib/auth"
import type { Order, OrderItem, Product } from "@/lib/types"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user } = await getSession()
    const admin = await isAdmin()

    // If not logged in, return unauthorized
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const id = Number.parseInt((await params).id)

    // Get the order
    const order = (await sql`
      SELECT * FROM orders WHERE id = ${id}
    `) as Order[]

    if (!order.length) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Check if the user is authorized to view this order
    if (!admin && order[0].user_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get order items
    const items = (await sql`
      SELECT oi.*, p.*
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ${id}
    `) as (OrderItem & { product: Product })[]

    return NextResponse.json({
      ...order[0],
      items,
    })
  } catch (error) {
    console.error("Error fetching order:", error)
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check if user is admin
    const admin = await isAdmin()
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const id = Number.parseInt(params.id)
    const { status } = await request.json()

    if (!status || !["Pending", "In Progress", "Delivered"].includes(status)) {
      return NextResponse.json({ error: "Valid status is required" }, { status: 400 })
    }

    const order = await sql`
      UPDATE orders
      SET status = ${status}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    ` as Order[]

    if (!order.length) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    return NextResponse.json(order[0])
  } catch (error) {
    console.error("Error updating order:", error)
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 })
  }
}
