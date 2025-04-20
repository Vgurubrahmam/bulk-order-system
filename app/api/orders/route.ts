import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getSession, isAdmin } from "@/lib/auth"
import type { OrderWithItems } from "@/lib/types"

export async function GET() {
  try {
    const { user } = await getSession()
    const admin = await isAdmin()

    // If not logged in, return unauthorized
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch orders with items in a single query
    const orders = await sql`
      SELECT 
        o.*,
        COALESCE(
          json_agg(
            json_build_object(
              'id', oi.id,
              'order_id', oi.order_id,
              'product_id', oi.product_id,
              'quantity', oi.quantity,
              'price', oi.price,
              'created_at', oi.created_at,
              'product', json_build_object(
                'id', p.id,
                'name', p.name,
                'description', p.description,
                'price', p.price,
                'image_url', p.image_url,
                'created_at', p.created_at,
                'updated_at', p.updated_at
              )
            )
          ) FILTER (WHERE oi.id IS NOT NULL),
          '[]'
        ) AS items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE ${admin ? sql`true` : sql`o.user_id = ${user.id}`}
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `

    return NextResponse.json(orders)
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user } = await getSession()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { items, deliveryDetails } = await request.json()

    // Validate request body
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Items array is required and cannot be empty" }, { status: 400 })
    }

    if (items.some(item => !item.productId || !item.quantity || item.quantity <= 0)) {
      return NextResponse.json({ error: "Each item must have a valid productId and quantity > 0" }, { status: 400 })
    }

    const { name, contact, address } = deliveryDetails || {}
    if (!name || !contact || !address) {
      return NextResponse.json({ error: "Name, contact, and address are required in delivery details" }, { status: 400 })
    }

    // Perform order creation within a transaction
    let order
    try {
      // Begin transaction
      await sql`BEGIN`

      // Insert the order with timestamps
      const orders = await sql`
        INSERT INTO orders (
          user_id, 
          status, 
          delivery_name, 
          delivery_contact, 
          delivery_address, 
          created_at, 
          updated_at
        )
        VALUES (${user.id}, 'Pending', ${name}, ${contact}, ${address}, NOW(), NOW())
        RETURNING *
      `
      order = orders[0]

      // Insert order items
      for (const item of items) {
        const products = await sql`
          SELECT * FROM products WHERE id = ${item.productId}
        `
        if (!products || products.length === 0) {
          throw new Error(`Product with ID ${item.productId} not found`)
        }
        const product = products[0]

        await sql`
          INSERT INTO order_items (
            order_id, 
            product_id, 
            quantity, 
            price, 
            created_at
          )
          VALUES (${order.id}, ${item.productId}, ${item.quantity}, ${product.price}, NOW())
        `
      }

      // Commit transaction
      await sql`COMMIT`
    } catch (error) {
      // Rollback transaction in case of error
      await sql`ROLLBACK`
      console.error("Transaction error:", error)
      throw error
    }

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error("Error creating order:", error)
    return NextResponse.json(
      { error: error instanceof Error ? `Failed to create order: ${error.message}` : "Failed to create order" },
      { status: 500 }
    )
  }
}