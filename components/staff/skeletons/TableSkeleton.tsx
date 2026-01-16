import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  showSearch?: boolean;
  showActions?: boolean;
}

export function TableSkeleton({ rows = 5, columns = 5, showSearch = true, showActions = false }: TableSkeletonProps) {
  return (
    <div className="space-y-6">
      {showSearch && (
        <Card>
          <CardContent className="pt-6">
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      )}
      
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="space-y-4">
              {/* Table Header */}
              <div className="flex gap-4 pb-2 border-b">
                {[...Array(columns)].map((_, i) => (
                  <Skeleton key={i} className="h-4 flex-1" />
                ))}
                {showActions && <Skeleton className="h-4 w-24" />}
              </div>
              
              {/* Table Rows */}
              {[...Array(rows)].map((_, i) => (
                <div key={i} className="flex gap-4 py-3">
                  {[...Array(columns)].map((_, j) => (
                    <Skeleton key={j} className="h-4 flex-1" />
                  ))}
                  {showActions && (
                    <div className="flex gap-2">
                      <Skeleton className="h-8 w-8" />
                      <Skeleton className="h-8 w-8" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
