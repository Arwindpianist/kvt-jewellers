import { notFound } from "next/navigation";
import { getProductById, getAllProducts } from "@/lib/db/products";
import { ProductDetailContent } from "@/components/public/ProductDetailContent";
import { generateProductMetadata } from "@/lib/metadata";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  const products = await getAllProducts();
  return products.map((product) => ({
    id: product.id,
  }));
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await getProductById(id);
  
  if (!product) {
    return {
      title: "Product Not Found",
    };
  }

  const imageUrl = product.images && product.images.length > 0 
    ? product.images[0] 
    : undefined;

  return generateProductMetadata(
    product.name,
    product.description || `Premium ${product.name} from KVT Jewellers`,
    product.id,
    imageUrl
  );
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  return <ProductDetailContent product={product} />;
}
