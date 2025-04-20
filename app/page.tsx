import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      <section className="w-full py-12 md:py-24 lg:py-32 bg-green-50 dark:bg-green-950">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                  Fresh Produce in Bulk
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  Order fresh vegetables and fruits in bulk for your business or event. We offer competitive prices and
                  reliable delivery.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button asChild size="lg">
                  <Link href="/products">Browse Products</Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/track-order">Track Your Order</Link>
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <img
                alt="Fresh produce"
                className="aspect-video overflow-hidden rounded-xl object-cover object-center"
                height="500"
                src="/placeholder.svg?height=500&width=800&text=Fresh+Produce"
                width="800"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">How It Works</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Our simple process makes bulk ordering easy and convenient
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-white text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-bold">Browse Products</h3>
              <p className="text-muted-foreground">Explore our wide range of fresh vegetables and fruits</p>
            </div>
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-white text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-bold">Place Your Order</h3>
              <p className="text-muted-foreground">Add items to your cart and provide delivery details</p>
            </div>
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-white text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-bold">Receive Fresh Produce</h3>
              <p className="text-muted-foreground">Get your order delivered to your doorstep</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
