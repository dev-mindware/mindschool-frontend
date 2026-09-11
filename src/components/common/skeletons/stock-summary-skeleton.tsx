import { Skeleton, DynamicMetricCardSkeleton, Card, CardHeader, CardContent } from "@/components";

export function StockSummarySkeleton() {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, idx) => (
                    <DynamicMetricCardSkeleton key={idx} />
                ))}
            </div>

            <Card className="border-muted-foreground/10 shadow-none">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
                    <div className="space-y-2">
                        <Skeleton className="h-6 w-64" />
                        <Skeleton className="h-4 w-48" />
                    </div>
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-[300px] w-full rounded-lg" />
                </CardContent>
            </Card>
        </div>
    );
}
