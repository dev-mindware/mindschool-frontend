import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export interface DetailsSheetSkeletonProps {
  className?: string;
  rows?: number;
}

/**
 * Skeleton para painéis laterais (Sheets/Drawers) e modais de consulta de detalhes.
 * Evita layout shifts e substitui divs com pulses inline.
 */
export function DetailsSheetSkeleton({
  className,
  rows = 6,
}: DetailsSheetSkeletonProps) {
  return (
    <div className={cn("space-y-6 p-6", className)}>
      {/* Header */}
      <div className="space-y-2 pb-4 border-b border-border/50">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>

      {/* Profile/Identity block preview */}
      <div className="flex items-center gap-4 rounded-xs border border-border/60 bg-muted/20 p-4">
        <Skeleton className="size-14 rounded-full shrink-0" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-3.5 w-56" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <Skeleton className="h-8 w-24 rounded-xs" />
        <Skeleton className="h-8 w-24 rounded-xs" />
        <Skeleton className="h-8 w-24 rounded-xs" />
      </div>

      {/* Details Key-Value List */}
      <div className="space-y-3 pt-2">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between py-2 border-b border-border/30"
          >
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="h-4 w-44" />
          </div>
        ))}
      </div>
    </div>
  );
}

