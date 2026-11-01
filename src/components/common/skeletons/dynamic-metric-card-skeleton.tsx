import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Skeleton espelhado de forma exacta com o DynamicMetricCard (Desktop e Mobile):
 * - Padding responsivo `p-3 md:p-4`
 * - Alturas tipográficas escalonadas para título, subtítulo e descrição
 * - Contentor de ícone `size-8 md:size-9 rounded-xs`
 */
export function DynamicMetricCardSkeleton({ className }: { className?: string }) {
  return (
    <Card
      className={cn(
        "border shadow-none overflow-hidden py-2 bg-gradient-to-t from-primary/2 to-card rounded-xs",
        className
      )}
    >
      <CardContent className="p-3 md:p-4 flex justify-between items-start">
        <div className="flex flex-col h-full flex-1 min-w-0">
          <div className="space-y-1.5">
            <div className="flex justify-between items-center gap-2">
              <Skeleton className="h-6 sm:h-7 md:h-8 w-20 sm:w-24 rounded-xs" />
              <Skeleton className="size-8 md:size-9 rounded-xs shrink-0 bg-muted/60" />
            </div>
            <Skeleton className="h-3.5 sm:h-4 w-24 sm:w-32 rounded-xs" />
          </div>
          <Skeleton className="mt-2.5 h-3 w-4/5 rounded-xs bg-muted/50" />
        </div>
      </CardContent>
    </Card>
  );
}
