import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { StaffPageHeader } from "@/components/staff/StaffPageHeader";
import { PurchaseAnalyticsContent } from "@/components/staff/PurchaseAnalyticsContent";

export default async function StaffAnalyticsPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login?from=/staff/analytics");
  }

  // Check if user is staff or admin
  const supabase = createServiceRoleClient();
  const { data: user } = await supabase
    .from('users')
    .select('role')
    .eq('id', session.user.id)
    .single();

  if (!user || !['admin', 'staff'].includes(user.role)) {
    redirect("/staff/dashboard");
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <StaffPageHeader
        icon="BarChart3"
        title="Purchase Analytics"
        description="View comprehensive price analytics for all product purchases with timestamps and market data"
      />
      <PurchaseAnalyticsContent />
    </div>
  );
}
