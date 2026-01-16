"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

/**
 * Staff login page - redirects to unified login page
 * Maintains backward compatibility by preserving the "from" parameter
 */
export default function StaffLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  useEffect(() => {
    // Preserve the "from" parameter if it exists, otherwise default to staff dashboard
    const from = searchParams.get("from") || "/staff/dashboard";
    router.replace(`/login?from=${encodeURIComponent(from)}`);
  }, [router, searchParams]);

  return null;
}
