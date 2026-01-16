import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { StaffPageHeader } from "@/components/staff/StaffPageHeader";
import { ActivityLog } from "@/components/staff/ActivityLog";
import { ActivitySkeleton } from "@/components/staff/skeletons/ActivitySkeleton";

export const dynamic = 'force-dynamic';

export default async function ActivityLogPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login?from=/staff/dashboard");
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <StaffPageHeader
        icon="FileText"
        title="Activity Log"
        description="View all system activities, price changes, and product updates"
      />
      <Suspense fallback={<ActivitySkeleton />}>
        <ActivityLog />
      </Suspense>
    </div>
  );
}
