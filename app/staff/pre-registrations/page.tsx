import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { PreRegistrationsManagement } from "@/components/staff/PreRegistrationsManagement";
import { StaffPageHeader } from "@/components/staff/StaffPageHeader";
import { TableSkeleton } from "@/components/staff/skeletons/TableSkeleton";

export const dynamic = 'force-dynamic';

export default async function PreRegistrationsPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login?from=/staff/pre-registrations");
  }

  // Check if user is admin
  const { createServiceRoleClient } = await import("@/lib/supabase/server");
  const supabase = createServiceRoleClient();
  const { data: user } = await supabase
    .from('users')
    .select('role')
    .eq('id', session.user.id)
    .single();

  if (!user || user.role !== 'admin') {
    redirect("/staff/dashboard");
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <StaffPageHeader
        icon="Users"
        title="Trading Pre-Registrations"
        description="Manage pre-registrations for the online trading platform"
      />
      <Suspense fallback={<TableSkeleton />}>
        <PreRegistrationsManagement />
      </Suspense>
    </div>
  );
}
