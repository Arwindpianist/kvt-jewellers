import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getAllProducts } from "@/lib/products";
import { ProductManager } from "@/components/staff/ProductManager";

export default async function StaffProductsPage() {
  const session = await getSession();

  if (!session) {
    redirect("/staff/login");
  }

  const products = getAllProducts();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold">Product Management</h1>
        <p className="text-muted-foreground">
          Manage your product catalog, add new products, and update existing ones
        </p>
      </div>

      <ProductManager initialProducts={products} />
    </div>
  );
}

