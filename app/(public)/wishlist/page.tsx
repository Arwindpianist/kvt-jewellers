import { cookies } from "next/headers";
import { WishlistPageClient } from "@/components/public/WishlistPageClient";
import { getMessages } from "@/i18n/request";

// MEMORY LEAK FIX: Use cached message loader instead of direct import
export async function generateMetadata() {
  const cookieStore = await cookies();
  const lang = cookieStore.get("kvt_lang")?.value ?? "en";
  const messages = await getMessages();
  const meta = messages.meta?.wishlist || {};
  
  return {
    title: meta.title || "Wishlist | KVT Jewellers",
    description: meta.description || "Your saved favorite products",
  };
}

export default async function WishlistPage() {
  return <WishlistPageClient />;
}
