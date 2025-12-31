import { notFound } from "next/navigation";
import { ProductCard } from "@/components/public/ProductCard";
import { getProductsByCategory } from "@/lib/products";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AnimatedSection, FadeIn } from "@/components/ui/animated-section";
import type { ProductCategory } from "@/types/products";
import { Coins, BarChart3, Gem } from "lucide-react";

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

const categoryMap: Record<string, { type: ProductCategory; icon: typeof Coins; description: string }> = {
  coin: {
    type: "coin",
    icon: Coins,
    description: "Premium gold and silver coins for investment and collection. Limited editions and commemorative pieces available.",
  },
  bar: {
    type: "bar",
    icon: BarChart3,
    description: "999.9 pure gold bars in various sizes. Perfect for serious investors and collectors seeking investment-grade bullion.",
  },
  jewellery: {
    type: "jewellery",
    icon: Gem,
    description: "Exquisite 916 gold jewelry designs. Handcrafted by professional goldsmiths with attention to detail and timeless elegance.",
  },
};

export async function generateMetadata({ params }: CategoryPageProps) {
  const { category } = await params;
  const categoryInfo = categoryMap[category];

  if (!categoryInfo) {
    return {
      title: "Category Not Found",
    };
  }

  const categoryLabel = category.charAt(0).toUpperCase() + category.slice(1);
  return {
    title: `${categoryLabel} | KVT Jewellers`,
    description: categoryInfo.description,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;
  const categoryInfo = categoryMap[category];

  if (!categoryInfo) {
    notFound();
  }

  const products = getProductsByCategory(categoryInfo.type);
  const categoryLabel = category.charAt(0).toUpperCase() + category.slice(1);
  const Icon = categoryInfo.icon;

  return (
    <div className="container mx-auto px-4 py-12">
      <FadeIn>
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex rounded-full bg-brand-100 p-4">
            <Icon className="h-8 w-8 text-brand-600" />
          </div>
          <Badge variant="outline" className="mb-4 border-brand-300 text-brand-700">
            {categoryLabel} Collection
          </Badge>
          <h1 className="mb-4 font-serif text-4xl font-bold md:text-6xl">
            {categoryLabel}
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            {categoryInfo.description}
          </p>
        </div>
      </FadeIn>

      <Separator className="mb-12" />

      {products.length === 0 ? (
        <AnimatedSection>
          <div className="py-16 text-center">
            <p className="mb-4 text-lg text-muted-foreground">
              No products found in this category.
            </p>
            <p className="text-sm text-muted-foreground">
              Please check back later or contact us for availability.
            </p>
          </div>
        </AnimatedSection>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product, i) => (
            <AnimatedSection key={product.id} delay={i * 0.1}>
              <ProductCard product={product} index={i} />
            </AnimatedSection>
          ))}
        </div>
      )}

      <AnimatedSection delay={0.3}>
        <div className="mt-16 rounded-lg border border-brand-200 bg-brand-50/50 p-8 text-center">
          <h3 className="mb-4 font-serif text-2xl font-semibold">
            Looking for Something Specific?
          </h3>
          <p className="mb-6 text-muted-foreground">
            Contact us for custom orders, bulk purchases, or special requests
          </p>
          <a
            href="/contact"
            className="inline-flex items-center rounded-md gold-gradient-button px-6 py-3 text-sm font-medium transition-colors"
          >
            Contact Us
          </a>
        </div>
      </AnimatedSection>
    </div>
  );
}
