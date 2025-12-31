import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { StaffHeader } from "@/components/staff/StaffHeader";

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
    <div className="flex min-h-screen flex-col">
      <StaffHeader />
      <main className="flex-1 bg-muted/30">{children}</main>
    </div>
  );
}

