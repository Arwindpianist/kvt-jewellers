import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { StaffPageHeader } from "@/components/staff/StaffPageHeader";
import { SettingsContent } from "@/components/staff/SettingsContent";
import { SettingsSkeleton } from "@/components/staff/skeletons/SettingsSkeleton";

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login?from=/staff/dashboard");
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <StaffPageHeader
        icon="Settings"
        title="Settings"
        description="Configure system settings and preferences"
      />
      <Suspense fallback={<SettingsSkeleton />}>
        <SettingsContent />
      </Suspense>
    </div>
  );
}
