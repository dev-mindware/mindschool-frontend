import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function SubscriptionSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-pulse">
      <div className="lg:col-span-2 space-y-6">
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <Skeleton className="h-6 w-40 bg-gray-200" />
            <Skeleton className="h-4 w-64 bg-gray-100 mt-2" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[...Array(3)].map((_, idx) => (
              <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-40" />
              {[...Array(2)].map((_, i) => (
                <Skeleton key={i} className="h-28 w-full rounded-lg" />
              ))}
            </div>
            <Skeleton className="h-12 w-full rounded-md" />
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="border-gray-200">
          <CardHeader>
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-14 w-full rounded-md" />
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardContent className="p-6 space-y-3">
            <Skeleton className="h-5 w-40" />
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-64" />
            <div className="flex space-x-2">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-6 w-12 rounded-md" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
