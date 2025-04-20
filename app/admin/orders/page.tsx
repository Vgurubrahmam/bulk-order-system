"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import type { Order } from "@/lib/types"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { isAdmin } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Eye } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function AdminOrdersPage() {
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)
  const [orders, setOrders] = useState<Order[]>([])

  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    async function checkAuth() {
      try {
        const admin = await isAdmin()

        if (!admin) {
          router.push("/login")
          return
        }

        setAuthorized(true)

        // Fetch orders
        const res = await fetch("/api/orders")
        const data = await res.json()
        setOrders(data)
      } catch (error) {
        console.error("Error checking auth:", error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  const updateOrderStatus = async (orderId: number, status: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        throw new Error("Failed to update order status")
      }

      // Update the order in the state
      setOrders(orders.map((order) => (order.id === orderId ? { ...order, status } : order)))

      toast({
        title: "Order updated",
        description: `Order #${orderId} status changed to ${status}`,
      })
    } catch (error) {
      console.error("Error updating order:", error)
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      })
    }
  }

  const columns: ColumnDef<Order>[] = [
    {
      accessorKey: "id",
      header: "Order ID",
    },
    {
      accessorKey: "delivery_name",
      header: "Customer",
    },
    {
      accessorKey: "delivery_contact",
      header: "Contact",
    },
    {
      accessorKey: "created_at",
      header: "Date",
      cell: ({ row }) => {
        const date = new Date(row.getValue("created_at"))
        return <div>{date.toLocaleDateString()}</div>
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string

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
          <Badge variant="outline" className={color}>
            {status}
          </Badge>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const order = row.original

        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => router.push(`/track-order?orderId=${order.id}`)}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => updateOrderStatus(order.id, "Pending")}
                  disabled={order.status === "Pending"}
                >
                  Mark as Pending
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => updateOrderStatus(order.id, "In Progress")}
                  disabled={order.status === "In Progress"}
                >
                  Mark as In Progress
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => updateOrderStatus(order.id, "Delivered")}
                  disabled={order.status === "Delivered"}
                >
                  Mark as Delivered
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]

  if (loading) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-8">Manage Orders</h1>
        <p>Loading...</p>
      </div>
    )
  }

  if (!authorized) {
    return null // Router will redirect
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Manage Orders</h1>

      <DataTable columns={columns} data={orders} searchKey="delivery_name" />
    </div>
  )
}
