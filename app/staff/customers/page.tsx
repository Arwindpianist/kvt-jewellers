import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { CustomerManagement } from "@/components/staff/CustomerManagement";
import { StaffPageHeader } from "@/components/staff/StaffPageHeader";

export const dynamic = 'force-dynamic';

export default async function CustomersPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login?from=/staff/dashboard");
  }

  // Check if user is admin or staff
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
        icon="Users"
        title="Customers"
        description="View customer accounts and statistics"
      />
      <CustomerManagement />
    </div>
  );
}
