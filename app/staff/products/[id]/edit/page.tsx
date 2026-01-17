import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { dbProductToProduct } from "@/lib/db/products";
import { ProductForm } from "@/components/staff/ProductForm";
import { StaffPageHeader } from "@/components/staff/StaffPageHeader";
import { notFound } from "next/navigation";

export const dynamic = 'force-dynamic';

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const session = await getSession();

  if (!session) {
    redirect("/login?from=/staff/products");
  }

  const { id } = await params;
  const supabase = createServiceRoleClient();

  const { data: productRow, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !productRow) {
    notFound();
  }

  const product = dbProductToProduct(productRow);

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <StaffPageHeader
        icon="Package"
        title="Edit Product"
        description={`Editing: ${product.name}`}
      />
      <ProductForm product={product} />
    </div>
  );
}
