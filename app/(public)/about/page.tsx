import { AboutPageClient } from "@/components/public/AboutPageClient";
import { getMessages } from "@/i18n/request";
import { generatePageMetadata } from "@/lib/metadata";

// MEMORY LEAK FIX: Use cached message loader instead of direct import
export async function generateMetadata() {
  const messages = await getMessages();
  const meta = messages.meta?.about || {};
  
  return generatePageMetadata({
    title: meta.title || "About Us | KVT Jewellers",
    description: meta.description || "Learn about KVT Jewellers, established in 2018. Premium gold and silver trading in Malaysia.",
    url: "/about",
    keywords: [
      "KVT Jewellers",
      "about us",
      "gold trading",
      "silver trading",
      "Malaysia",
      "precious metals",
      "established 2018",
    ],
  });
}

export default async function AboutPage() {
  return <AboutPageClient />;
}
