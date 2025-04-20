"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { isAdmin } from "@/lib/auth"
import type { OrderWithItems, Product } from "@/lib/types"

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    inProgressOrders: 0,
    deliveredOrders: 0,
    totalProducts: 0,
  })

  const router = useRouter()

  useEffect(() => {
    async function checkAuth() {
      try {
        const admin = await isAdmin()

        if (!admin) {
          router.push("/login")
          return
        }

        setAuthorized(true)

        // Fetch dashboard stats
        const [ordersRes, productsRes] = await Promise.all([
          fetch("/api/orders"),
          fetch("/api/products"),
        ])

        if (!ordersRes.ok) {
          throw new Error("Failed to fetch orders")
        }
        if (!productsRes.ok) {
          throw new Error("Failed to fetch products")
        }

        const orders: OrderWithItems[] = await ordersRes.json()
        const products: Product[] = await productsRes.json()

        // Validate that orders is an array
        if (!Array.isArray(orders)) {
          throw new Error("Orders data is not an array")
        }
        if (!Array.isArray(products)) {
          throw new Error("Products data is not an array")
        }

        setStats({
          totalOrders: orders.length,
          pendingOrders: orders.filter((o) => o.status === "Pending").length,
          inProgressOrders: orders.filter((o) => o.status === "In Progress").length,
          deliveredOrders: orders.filter((o) => o.status === "Delivered").length,
          totalProducts: products.length,
        })
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
        setError(error instanceof Error ? error.message : "An unexpected error occurred")
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  if (loading) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        <p>Loading...</p>
      </div>
    )
  }

  if (!authorized) {
    return null // Router will redirect
  }

  if (error) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingOrders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inProgressOrders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivered Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.deliveredOrders}</div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 lg:col-span-4">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}