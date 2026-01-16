import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getOrderById } from "@/lib/db/orders";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { OrderDetail } from "@/components/staff/OrderDetail";
import { StaffPageHeader } from "@/components/staff/StaffPageHeader";
import { OrderDetailSkeleton } from "@/components/staff/skeletons/OrderDetailSkeleton";

export const dynamic = 'force-dynamic';

interface OrderPageProps {
  params: Promise<{ orderId: string }>;
}

export default async function StaffOrderDetailPage({ params }: OrderPageProps) {
  const session = await getSession();
  const { orderId } = await params;

  if (!session) {
    redirect("/login?from=/staff/dashboard");
  }

  // Get order (staff can view any order)
  const supabase = createServiceRoleClient();
  const { data: orderData, error } = await supabase
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
    .eq('id', orderId)
    .single();

  if (error || !orderData) {
    redirect("/staff/orders");
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <StaffPageHeader
        icon="ShoppingBag"
        title={`Order ${orderData.payment_reference}`}
        description="View order details and verify payment"
      />
      <Suspense fallback={<OrderDetailSkeleton />}>
        <OrderDetail order={orderData as any} currentUserId={session.user.id} />
      </Suspense>
    </div>
  );
}