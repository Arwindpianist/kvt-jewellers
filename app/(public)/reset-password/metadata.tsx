import { generatePageMetadata } from "@/lib/metadata";

export async function generateMetadata() {
  return generatePageMetadata({
    title: "Reset Password | KVT Jewellers",
    description: "Reset your password to regain access to your account",
    url: "/reset-password",
    noIndex: true, // Password reset pages shouldn't be indexed
    keywords: ["reset password", "forgot password", "account recovery", "KVT Jewellers"],
  });
}
