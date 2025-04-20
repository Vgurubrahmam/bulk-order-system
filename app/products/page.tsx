import { sql } from "@/lib/db"
import type { Product } from "@/lib/types"
import { ClientProductList } from "./client"

export default async function ProductsPage() {
  const products = await sql<Product[]>`
    SELECT * FROM products ORDER BY name ASC
  `

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Products</h1>
      <ClientProductList initialProducts={products} />
    </div>
  )
}
