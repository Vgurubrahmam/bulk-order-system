"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import type { OrderWithItems, User } from "@/lib/types"
import { getSession } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function OrdersPage() {
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState<OrderWithItems[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const router = useRouter()

  useEffect(() => {
    async function fetchData() {
      try {
        const { user } = await getSession()

        if (!user) {
          setIsAuthenticated(false)
          return
        }

        setIsAuthenticated(true)

        // Fetch orders with type assertion
        const res = await fetch("/api/orders")
        if (!res.ok) {
          throw new Error("Failed to fetch orders")
        }
        const data: OrderWithItems[] = await res.json()
        setOrders(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unexpected error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [router])

  const getStatusBadge = (status: string) => {
    let color = ""
    switch (status) {
      case "Pending":
        color = "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
        break
      case "In Progress":
        color = "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
        break
      case "Delivered":
        color = "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
        break
    }

    return (
      <Badge variant="outline" className={color} aria-label={`Order status: ${status}`}>
        {status}
      </Badge>
    )
  }

  if (!isAuthenticated) {
    router.push("/login")
    return null
  }

  if (loading) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-8">My Orders</h1>
        <p>Loading...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-8">My Orders</h1>
        <p className="text-red-500">{error}</p>
        <Button onClick={() => window.location.reload()} aria-label="Retry loading orders">
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-4">You haven't placed any orders yet</h2>
          <Button onClick={() => router.push("/products")} aria-label="Browse products">
            Browse Products
          </Button>
        </div>
      ) : (
        <div className="grid gap-6">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Order #{order.id}</CardTitle>
                  {getStatusBadge(order.status)}
                </div>
                <CardDescription>
                  Placed on {format(new Date(order.created_at), "MMMM d, yyyy")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p><strong>Delivery Address:</strong> {order.delivery_address}</p>
                  <p><strong>Items:</strong> {order.items.length} items</p>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  onClick={() => router.push(`/orders/${order.id}`)}
                  aria-label={`View details for order ${order.id}`}
                >
                  View Details
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}