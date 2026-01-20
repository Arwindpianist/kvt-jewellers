import { generatePageMetadata } from "@/lib/metadata";

export async function generateMetadata() {
  return generatePageMetadata({
    title: "Create Account | KVT Jewellers",
    description: "Join KVT Jewellers to shop premium gold and silver products",
    url: "/register",
    noIndex: true, // Registration page shouldn't be indexed
    keywords: ["register", "sign up", "create account", "KVT Jewellers"],
  });
}
