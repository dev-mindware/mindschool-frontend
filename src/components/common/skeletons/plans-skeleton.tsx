import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export type PlanCardSkeletonProps = {
  badge?: boolean;
  priceWidth?: string;
};

export function PlanCardSkeleton({
  badge = false,
  priceWidth = "w-32",
}: PlanCardSkeletonProps) {
  const features = Array.from({ length: 4 });

  return (
    <Card className="relative border border-border h-96 rounded-xs">
      {badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="bg-primary/20 text-primary rounded-full">
            <Skeleton className="h-4 w-16" />
          </Badge>
        </div>
      )}

      <CardHeader className={`text-center space-y-4 ${badge ? "pt-8" : ""}`}>
        <Skeleton className="h-6 w-24 mx-auto" />

        <div className="space-y-2">
          <Skeleton className={`h-10 ${priceWidth} mx-auto`} />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4 mx-auto" />
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {features.map((_, index) => (
          <div key={index} className="flex items-center space-x-2">
            <Skeleton className="size-4 rounded-full" />
            <Skeleton className="h-4 flex-1" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function PlansPageSkeleton() {
  return (
    <div className="mx-auto space-y-8 animate-in fade-in duration-200">
      <div className="grid gap-6 md:grid-cols-3">
        <PlanCardSkeleton />
        <PlanCardSkeleton badge />
        <PlanCardSkeleton />
      </div>
    </div>
  );
}

export function PlanCheckoutSkeleton() {
  return (
    <div className="mx-auto max-w-5xl space-y-6 animate-in fade-in duration-200">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64 rounded-xs" />
        <Skeleton className="h-4 w-96 rounded-xs" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <Skeleton className="h-64 w-full rounded-xs" />
          <Skeleton className="h-32 w-full rounded-xs" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-72 w-full rounded-xs" />
        </div>
      </div>
    </div>
  );
}
