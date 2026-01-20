import { getMessages } from "@/i18n/request";
import { generatePageMetadata } from "@/lib/metadata";

// MEMORY LEAK FIX: Use cached message loader instead of direct import
export async function generateMetadata() {
  const messages = await getMessages();
  const meta = messages.meta?.contact || {};
  
  return generatePageMetadata({
    title: meta.title || "Contact Us | KVT Jewellers",
    description: meta.description || "Get in touch with KVT Jewellers for inquiries and support",
    url: "/contact",
    keywords: [
      "contact KVT Jewellers",
      "customer support",
      "inquiries",
      "gold jewelry inquiries",
      "Malaysia",
    ],
  });
}
