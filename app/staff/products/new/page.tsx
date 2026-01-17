import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { ProductForm } from "@/components/staff/ProductForm";
import { StaffPageHeader } from "@/components/staff/StaffPageHeader";

export const dynamic = 'force-dynamic';

export default async function NewProductPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login?from=/staff/products/new");
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <StaffPageHeader
        icon="Package"
        title="Add New Product"
        description="Create a new product in your catalog"
      />
      <ProductForm />
    </div>
  );
}
