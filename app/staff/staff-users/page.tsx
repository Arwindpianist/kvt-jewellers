import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { StaffUserManagement } from "@/components/staff/StaffUserManagement";
import { StaffPageHeader } from "@/components/staff/StaffPageHeader";

export const dynamic = 'force-dynamic';

export default async function StaffUsersPage() {
  const session = await getSession();

  if (!session) {
    redirect("/staff/login");
  }

  // Check if user is admin
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
        title="Staff Users"
        description="Manage staff and admin accounts"
      />
      <StaffUserManagement />
    </div>
  );
}
