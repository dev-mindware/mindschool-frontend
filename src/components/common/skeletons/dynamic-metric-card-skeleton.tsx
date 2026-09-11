import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export function DynamicMetricCardSkeleton({ className }: { className?: string }) {
    return (
        <Card className={cn("border shadow-none overflow-hidden py-2 bg-gradient-to-t from-primary/[0.02] to-card animate-pulse", className)}>
            <CardContent className="p-4">
                <div className="flex flex-col space-y-3">
                    <div className="space-y-2">
                        <div className="flex justify-between items-start">
                            <Skeleton className="h-8 w-24 bg-muted/60" />
                            <Skeleton className="h-8 w-8 rounded-md bg-muted/40" />
                        </div>
                        <Skeleton className="h-6 w-32 bg-muted/50" />
                    </div>
                    <div className="mt-2 text-transparent">
                        <Skeleton className="h-4 w-full bg-muted/30" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}