import Link from "next/link";
import { ProductCard } from "@/components/public/ProductCard";
import { getAllProducts } from "@/lib/products";
import { Button } from "@/components/ui/button";
import { AnimatedButton } from "@/components/public/AnimatedButton";
import { AnimatedIcon } from "@/components/public/AnimatedIcon";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AnimatedSection, FadeIn } from "@/components/ui/animated-section";
import { StaggerAnimation, StaggerItem } from "@/components/ui/stagger-animation";
import { HoverCard } from "@/components/ui/hover-card";
import { Coins, BarChart3, Gem } from "lucide-react";

export const metadata = {
  title: "Products | KVT Jewellers",
  description: "Browse our collection of gold coins, bars, and jewelry",
};

export default function ProductsPage() {
  const products = getAllProducts();

  const categories = [
    { 
      href: "/products/coin", 
      label: "Coins", 
      count: products.filter((p) => p.category === "coin").length,
      icon: Coins,
      description: "Premium gold and silver coins for investment and collection"
    },
    { 
      href: "/products/bar", 
      label: "Bars", 
      count: products.filter((p) => p.category === "bar").length,
      icon: BarChart3,
      description: "999.9 pure gold bars in various sizes"
    },
    { 
      href: "/products/jewellery", 
      label: "Jewelry", 
      count: products.filter((p) => p.category === "jewellery").length,
      icon: Gem,
      description: "Exquisite 916 gold jewelry designs"
    },
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <FadeIn>
        <div className="mb-12 text-center">
          <Badge variant="outline" className="mb-4 border-brand-300 text-brand-700">
            Our Collection
          </Badge>
          <h1 className="mb-4 font-serif text-4xl font-bold md:text-6xl">
            Our Products
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Premium gold and silver products for investment and collection
          </p>
        </div>
      </FadeIn>

      {/* Category Navigation with Icons */}
      <AnimatedSection>
        <div className="mb-12">
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-8 grid w-full grid-cols-4">
              <TabsTrigger value="all" className="transition-all hover:scale-105">
                All Products
              </TabsTrigger>
              {categories.map((category) => (
                <TabsTrigger
                  key={category.href}
                  value={category.label.toLowerCase()}
                  className="transition-all hover:scale-105"
                >
                  {category.label} ({category.count})
                </TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value="all" className="mt-0">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {products.map((product, i) => (
                  <AnimatedSection key={product.id} delay={i * 0.1}>
                    <ProductCard product={product} />
                  </AnimatedSection>
                ))}
              </div>
            </TabsContent>
            {categories.map((category) => (
              <TabsContent key={category.href} value={category.label.toLowerCase()} className="mt-0">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {products
                    .filter((p) => p.category === category.label.toLowerCase().replace("jewelry", "jewellery"))
                    .map((product, i) => (
                      <AnimatedSection key={product.id} delay={i * 0.1}>
                        <ProductCard product={product} />
                      </AnimatedSection>
                    ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </AnimatedSection>

      {/* Category Cards */}
      <AnimatedSection delay={0.2}>
        <StaggerAnimation>
          <div className="grid gap-6 md:grid-cols-3">
            {categories.map((category) => (
              <StaggerItem key={category.href}>
                <HoverCard>
                  <div className="group rounded-lg border-2 border-brand-200 bg-gradient-to-br from-brand-50/50 to-white p-6 transition-all hover:border-brand-400 hover:shadow-lg">
                    <AnimatedIcon className="mb-4 inline-flex rounded-lg bg-brand-100 p-3">
                      <category.icon className="h-6 w-6 text-brand-600" />
                    </AnimatedIcon>
                    <h3 className="mb-2 font-serif text-2xl font-semibold">{category.label}</h3>
                    <p className="mb-4 text-sm text-muted-foreground">{category.description}</p>
                    <AnimatedButton asChild variant="outline" className="w-full">
                      <Link href={category.href}>View {category.label} →</Link>
                    </AnimatedButton>
                  </div>
                </HoverCard>
              </StaggerItem>
            ))}
          </div>
        </StaggerAnimation>
      </AnimatedSection>
    </div>
  );
}
