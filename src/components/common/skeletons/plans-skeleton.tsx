import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type SkeletonProps = {
  className?: string;
};

function Skeleton({ className = "" }: SkeletonProps) {
  return <div className={`animate-pulse bg-muted rounded ${className}`} />;
}

type PlanCardSkeletonProps = {
  badge?: boolean;
  priceWidth?: string;
};

function PlanCardSkeleton({
  badge = false,
  priceWidth = "w-32",
}: PlanCardSkeletonProps) {
  const features = Array.from({ length: 4 });

  return (
    <Card className="relative border border-border h-96">
      {badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="bg-primary/20 text-primary">
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
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 flex-1" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function PlansPageSkeleton() {
  return (
    <div className="mx-auto space-y-8">
      <div className="grid gap-6 md:grid-cols-3">
        <PlanCardSkeleton />
        <PlanCardSkeleton badge />
        <PlanCardSkeleton priceWidth="w-36" />
      </div>
    </div>
  );
}
