import { Card, CardContent, CardHeader, Skeleton } from "@/components";

export function ProductCardSkeleton() {
  return (
    <Card className="relative overflow-hidden border border-border bg-card">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-lg" />
            <div className="flex-1 min-w-0 space-y-2">
              <Skeleton className="h-4 w-32" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-3 w-10 rounded-lg" />
              </div>
            </div>
          </div>
          <Skeleton className="h-6 w-6 rounded-md" />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* <div className="space-y-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-3/4" />
        </div> */}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Skeleton className="h-3 w-20 mb-2" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ProductCardSkeletonGrid() {
  return (
    <div className="w-full grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
