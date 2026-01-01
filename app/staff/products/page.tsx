import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getAllProducts } from "@/lib/products";
import { ProductManager } from "@/components/staff/ProductManager";
import { StaffPageHeader } from "@/components/staff/StaffPageHeader";

export default async function StaffProductsPage() {
  const session = await getSession();

  if (!session) {
    redirect("/staff/login");
  }

  const products = getAllProducts();

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <StaffPageHeader
        icon="Package"
        title="Product Management"
        description="Manage your product catalog, add new products, and update existing ones"
      />
      <ProductManager initialProducts={products} />
    </div>
  );
}

