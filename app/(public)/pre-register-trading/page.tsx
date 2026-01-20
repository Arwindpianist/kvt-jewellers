import { Suspense } from "react";
import { PreRegisterTradingForm } from "@/components/public/PreRegisterTradingForm";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { generatePageMetadata } from "@/lib/metadata";

export async function generateMetadata() {
  return generatePageMetadata({
    title: "Pre-Register for Online Trading | KVT Jewellers",
    description: "Be among the first to experience our revolutionary online trading platform for gold and silver",
    url: "/pre-register-trading",
    keywords: [
      "online trading",
      "gold trading",
      "silver trading",
      "pre-register",
      "trading platform",
      "KVT Jewellers",
      "precious metals trading",
    ],
  });
}

function FormSkeleton() {
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardContent className="pt-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-brand-600" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function PreRegisterTradingPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <Suspense fallback={<FormSkeleton />}>
        <PreRegisterTradingForm />
      </Suspense>
    </div>
  );
}
