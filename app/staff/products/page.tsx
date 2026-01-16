import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { ProductManager } from "@/components/staff/ProductManager";
import { StaffPageHeader } from "@/components/staff/StaffPageHeader";
import { ProductManagerSkeleton } from "@/components/staff/skeletons/ProductManagerSkeleton";

export const dynamic = 'force-dynamic';

export default async function StaffProductsPage() {
  const session = await getSession();

  if (!session) {
    redirect("/staff/login");
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <StaffPageHeader
        icon="Package"
        title="Product Management"
        description="Manage your product catalog, add new products, and update existing ones"
      />
      <Suspense fallback={<ProductManagerSkeleton />}>
        <ProductManager />
      </Suspense>
    </div>
  );
}

