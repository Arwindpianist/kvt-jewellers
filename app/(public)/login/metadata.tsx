import { generatePageMetadata } from "@/lib/metadata";

export async function generateMetadata() {
  return generatePageMetadata({
    title: "Sign In | KVT Jewellers",
    description: "Sign in to your KVT Jewellers account to continue shopping",
    url: "/login",
    noIndex: true, // Login page shouldn't be indexed
    keywords: ["login", "sign in", "account", "KVT Jewellers"],
  });
}
