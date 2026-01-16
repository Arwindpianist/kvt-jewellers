import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { OrderList } from "@/components/staff/OrderList";
import { StaffPageHeader } from "@/components/staff/StaffPageHeader";
import { OrdersSkeleton } from "@/components/staff/skeletons/OrdersSkeleton";

export const dynamic = 'force-dynamic';

export default async function StaffOrdersPage() {
  const session = await getSession();

  if (!session) {
    redirect("/staff/login");
  }

  // Get all orders (staff can view all)
  const supabase = createServiceRoleClient();
  const { data: orders, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        id,
        product_id,
        quantity,
        price_at_purchase,
        metal_price_usd,
        exchange_rate_myr,
        exchange_rate_inr,
        pricing_metadata,
        product:products (
          id,
          name,
          image
        )
      ),
      payment:payments (
        id,
        status,
        verified_by,
        verified_at
      ),
      user:users (
        id,
        name,
        email
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching orders:", error);
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <StaffPageHeader
        icon="ShoppingBag"
        title="Order Management"
        description="View and manage customer orders"
      />
      <Suspense fallback={<OrdersSkeleton />}>
        <OrderList orders={orders || []} />
      </Suspense>
    </div>
  );
}