import { notFound } from "next/navigation";
import { ProductCard } from "@/components/public/ProductCard";
import { getAllProducts } from "@/lib/db/products";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AnimatedSection, FadeIn } from "@/components/ui/animated-section";
import type { ProductCategory } from "@/types/products";
import { categoryConfig, categoryGroups } from "@/lib/product-categories";
import { Coins, BarChart3, Gem, Sparkles } from "lucide-react";

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

// Map URL slugs to actual categories
const categorySlugMap: Record<string, ProductCategory[]> = {
  // Legacy routes for backward compatibility
  coin: ["gold_coin", "silver_coin"],
  bar: ["gold_bar", "silver_bar"],
  jewellery: categoryGroups.jewelry.categories,
  // New specific routes
  "gold-bar": ["gold_bar"],
  "silver-bar": ["silver_bar"],
  "gold-coin": ["gold_coin"],
  "silver-coin": ["silver_coin"],
  necklace: ["necklace"],
  chain: ["chain"],
  pendant: ["pendant"],
  choker: ["choker"],
  bangle: ["bangle"],
  bracelet: ["bracelet"],
  "charm-bracelet": ["charm_bracelet"],
  ring: ["ring"],
  "engagement-ring": ["engagement_ring"],
  "wedding-ring": ["wedding_ring"],
  earring: ["earring"],
  "stud-earring": ["stud_earring"],
  "hoop-earring": ["hoop_earring"],
  "drop-earring": ["drop_earring"],
  anklet: ["anklet"],
  "toe-ring": ["toe_ring"],
  other: ["other"],
};

const getCategoryInfo = (categories: ProductCategory[]) => {
  const primaryCategory = categories[0];
  const config = categoryConfig[primaryCategory];
  
  let icon = Gem;
  if (config.group === "investment") {
    icon = primaryCategory.includes("coin") ? Coins : BarChart3;
  } else {
    icon = Gem;
  }
  
  return {
    categories,
    icon,
    label: config.label,
    description: `Explore our collection of ${config.label.toLowerCase()} products. ${config.group === "investment" ? "Investment-grade precious metals." : "Handcrafted jewelry pieces."}`,
  };
};

export async function generateMetadata({ params }: CategoryPageProps) {
  const { category } = await params;
  const categorySlugs = categorySlugMap[category];

  if (!categorySlugs) {
    return {
      title: "Category Not Found",
    };
  }

  const categoryInfo = getCategoryInfo(categorySlugs);
  return {
    title: `${categoryInfo.label} | KVT Jewellers`,
    description: categoryInfo.description,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;
  const categorySlugs = categorySlugMap[category];

  if (!categorySlugs) {
    notFound();
  }

  // Get all products and filter by categories
  const allProducts = await getAllProducts();
  const products = allProducts.filter((p) => categorySlugs.includes(p.category));
  
  const categoryInfo = getCategoryInfo(categorySlugs);
  const Icon = categoryInfo.icon;

  return (
    <div className="container mx-auto px-4 py-12">
      <FadeIn>
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex rounded-full bg-brand-100 p-4">
            <Icon className="h-8 w-8 text-brand-600" />
          </div>
          <Badge variant="outline" className="mb-4 border-brand-300 text-brand-700">
            {categoryInfo.label} Collection
          </Badge>
          <h1 className="mb-4 font-serif text-4xl font-bold md:text-6xl">
            {categoryInfo.label}
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
