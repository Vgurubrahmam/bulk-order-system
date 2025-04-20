export interface User {
  id: number
  name: string
  email: string
  role: "buyer" | "admin"
}

export interface Product {
  id: number
  name: string
  description: string | null
  price: number
  image_url: string | null
  created_at: string
  updated_at: string
}

export interface Order {
  id: number
  user_id: number | null
  status: "Pending" | "In Progress" | "Delivered"
  delivery_name: string
  delivery_contact: string
  delivery_address: string
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: number
  order_id: number
  product_id: number
  quantity: number
  price: number
  created_at: string
}

export interface OrderWithItems extends Order {
  items: (OrderItem & { product: Product })[]
}

export interface CartItem {
  product: Product
  quantity: number
}
