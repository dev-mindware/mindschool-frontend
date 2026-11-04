import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Skeleton espelhado de forma exacta com o DynamicMetricCard (Desktop e Mobile):
 * - Padding responsivo `p-3 sm:p-4`
 * - Alturas tipográficas escalonadas para título, subtítulo e descrição
 * - Contentor de ícone `size-7 sm:size-8 rounded-xs`
 */
export function DynamicMetricCardSkeleton({ className }: { className?: string }) {
  return (
    <Card
      className={cn(
        "h-full flex flex-col justify-between border shadow-none overflow-hidden py-0 bg-card rounded-xs",
        className
      )}
    >
      <CardContent className="p-3 sm:p-4 flex flex-col justify-between flex-1 gap-1.5 min-w-0">
        <div className="space-y-1.5 min-w-0">
          <div className="flex justify-between items-start gap-2">
            <Skeleton className="h-6 sm:h-7 w-20 sm:w-24 rounded-xs" />
            <Skeleton className="size-7 sm:size-8 rounded-xs shrink-0 bg-muted/60" />
          </div>
          <Skeleton className="h-3.5 sm:h-4 w-24 sm:w-32 rounded-xs" />
        </div>
        <div className="mt-auto pt-1">
          <Skeleton className="h-3 w-4/5 rounded-xs bg-muted/50" />
        </div>
      </CardContent>
    </Card>
  );
}
