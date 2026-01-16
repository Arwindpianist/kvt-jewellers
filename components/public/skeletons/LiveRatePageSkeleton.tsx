import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function LiveRatePageSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="mb-8">
        <div className="text-center mb-4">
          <Skeleton className="h-6 w-32 mx-auto mb-4" />
          <Skeleton className="h-12 w-full max-w-2xl mx-auto mb-4" />
          <Skeleton className="h-5 w-full max-w-xl mx-auto mb-6" />
        </div>
        
        {/* Currency Selector */}
        <div className="flex justify-center">
          <Skeleton className="h-10 w-64" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content - Two Tables */}
        <div className="lg:col-span-2 space-y-6">
          {/* Mobile Table Skeleton - Hidden on Desktop */}
          <Card className="md:hidden bg-card-level-2 shadow-card-elevated">
            <CardHeader className="bg-brand-50">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-6 w-16" />
              </div>
            </CardHeader>
            <CardContent className="pt-4 px-3 pb-3">
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-5 w-32" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Desktop Live Rates Table Skeleton */}
          <Card className="hidden md:block bg-card-level-2 shadow-card-elevated">
            <CardHeader className="bg-brand-50">
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-32" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-3">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="flex gap-4 pb-3 border-b last:border-0">
                    <Skeleton className="h-4 w-32 flex-shrink-0" />
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-5 w-24 ml-auto" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* TradingView Widget Skeleton */}
          <Card className="bg-card-level-2 shadow-card-elevated">
            <CardHeader className="bg-brand-50">
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent className="p-6 pt-6">
              <Skeleton className="w-full h-[400px] sm:h-[500px] md:h-[600px] lg:h-[700px] xl:h-[800px]" />
            </CardContent>
          </Card>

          {/* Product Rates Table Skeleton */}
          <Card className="bg-card-level-2 shadow-card-elevated">
            <CardHeader className="bg-brand-50">
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex gap-4 pb-2 border-b">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32 ml-auto" />
                </div>
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex gap-4 py-2 border-b last:border-0">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-5 w-32 ml-auto" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Skeleton */}
        <Card className="bg-card-level-2 shadow-card-elevated">
          <CardHeader className="bg-brand-50">
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-5 w-3/4" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notice Section */}
      <div className="mt-8 rounded-lg border border-brand-200 bg-brand-50/50 p-6">
        <Skeleton className="h-5 w-40 mb-2" />
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-5/6" />
      </div>

      {/* Disclaimer */}
      <div className="mt-8 rounded-lg border border-brand-200/50 bg-card-level-1 shadow-card p-6">
        <Skeleton className="h-3 w-full mb-2" />
        <Skeleton className="h-3 w-full mb-2" />
        <Skeleton className="h-3 w-4/5 mx-auto" />
      </div>
    </div>
  );
}
