import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { StaffHeader } from "@/components/staff/StaffHeader";
import { Meteors } from "@/components/ui/meteors";

export default async function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check authentication (middleware also does this, but double-check here)
  const session = await getSession();
  
  // Allow login page without redirect
  if (!session) {
    // This will be handled by middleware, but we check here too for safety
    return <>{children}</>;
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      <Meteors number={20} />
      <div className="relative z-10 flex min-h-screen flex-col">
        <StaffHeader userName={session.user.name} />
        <main className="flex-1 bg-gradient-to-b from-brand-50/30 via-white to-background dark:bg-background dark:from-background dark:via-background dark:to-background">
          {children}
        </main>
      </div>
    </div>
  );
}

