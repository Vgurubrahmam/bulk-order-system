"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { OrderWithItems } from "@/lib/types"
import { formatPrice } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CheckCircle, Clock, Truck, AlertCircle } from "lucide-react"

export default function TrackOrderPage() {
  const searchParams = useSearchParams()
  const initialOrderId = searchParams.get("orderId") || ""

  const [orderId, setOrderId] = useState(initialOrderId)
  const [order, setOrder] = useState<OrderWithItems | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { toast } = useToast()

  const fetchOrder = async () => {
    if (!orderId) {
      setError("Please enter an order ID")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/orders/${orderId}`)

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Order not found")
        } else {
          throw new Error("Failed to fetch order")
        }
      }

      const data = await response.json()
      setOrder(data)
    } catch (error) {
      console.error("Error fetching order:", error)
      setError((error as Error).message)
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Fetch order if ID is provided in URL
  useEffect(() => {
    if (initialOrderId) {
      fetchOrder()
    }
  }, [initialOrderId])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Pending":
        return <Clock className="h-6 w-6 text-yellow-500" />
      case "In Progress":
        return <Truck className="h-6 w-6 text-blue-500" />
      case "Delivered":
        return <CheckCircle className="h-6 w-6 text-green-500" />
      default:
        return <AlertCircle className="h-6 w-6 text-red-500" />
    }
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Track Your Order</h1>

      <div className="max-w-md mb-8">
        <div className="flex gap-4">
          <div className="flex-1">
            <Label htmlFor="orderId">Order ID</Label>
            <Input
              id="orderId"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="Enter your order ID"
            />
          </div>
          <div className="flex items-end">
            <Button onClick={fetchOrder} disabled={loading}>
              {loading ? "Tracking..." : "Track"}
            </Button>
          </div>
        </div>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>

      {order && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Order #{order.id}</span>
              <div className="flex items-center gap-2">
                {getStatusIcon(order.status)}
                <span>{order.status}</span>
              </div>
            </CardTitle>
            <CardDescription>Placed on {new Date(order.created_at).toLocaleDateString()}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              <div>
                <h3 className="font-semibold mb-2">Delivery Details</h3>
                <p>
                  <strong>Name:</strong> {order.delivery_name}
                </p>
                <p>
                  <strong>Contact:</strong> {order.delivery_contact}
                </p>
                <p>
                  <strong>Address:</strong> {order.delivery_address}
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Order Items</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {order.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.product?.name ?? "Unknown Product"}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">{formatPrice(item.price)}</TableCell>
                        <TableCell className="text-right">{formatPrice(item.price * item.quantity)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <div>
              Status: <strong>{order.status}</strong>
            </div>
            <div className="text-lg font-bold">
              Total: {formatPrice(order.items.reduce((total, item) => total + item.price * item.quantity, 0))}
            </div>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}