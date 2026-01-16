import { redirect } from "next/navigation";

/**
 * Redirect /staff to /staff/dashboard
 */
export default function StaffRootPage() {
  redirect("/staff/dashboard");
}
