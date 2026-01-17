import { AboutPageClient } from "@/components/public/AboutPageClient";
import { getMessages } from "@/i18n/request";

// MEMORY LEAK FIX: Use cached message loader instead of direct import
export async function generateMetadata() {
  const messages = await getMessages();
  const meta = messages.meta?.about || {};
  
  return {
    title: meta.title || "About Us | KVT Jewellers",
    description: meta.description || "Learn about KVT Jewellers, established in 2018",
  };
}

export default async function AboutPage() {
  return <AboutPageClient />;
}
