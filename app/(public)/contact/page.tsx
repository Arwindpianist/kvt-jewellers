import { ContactPageClient } from "@/components/public/ContactPageClient";
import { generateMetadata } from "./metadata";

export { generateMetadata };

export default async function ContactPage() {
  return <ContactPageClient />;
}
