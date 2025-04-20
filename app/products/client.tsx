"use client"

import { useState } from "react"
import type { Product } from "@/lib/types"
import { ProductCard } from "@/components/product-card"
import { useCart } from "@/components/cart-provider"
import { useToast } from "@/hooks/use-toast"

interface ClientProductListProps {
  initialProducts: Product[]
}

export function ClientProductList({ initialProducts }: ClientProductListProps) {
  const [products] = useState<Product[]>(initialProducts)
  const { addItem } = useCart()
  const { toast } = useToast()

  const handleAddToCart = (product: Product) => {
    addItem(product)
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    })
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
      ))}
    </div>
  )
}
