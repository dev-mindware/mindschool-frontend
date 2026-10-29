import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export interface CardGridSkeletonProps {
  count?: number;
  className?: string;
  itemClassName?: string;
  hasHeaderIcon?: boolean;
}

/**
 * Skeleton para grelhas responsivas de cartões (planos, certificados, métricas, etc.).
 * Alinhado com o padrão Card do vintage-design-system (rounded-xs).
 */
export function CardGridSkeleton({
  count = 4,
  className,
  itemClassName,
  hasHeaderIcon = true,
}: CardGridSkeletonProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
        className
      )}
    >
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className={cn(
            "rounded-xs border border-border bg-card p-5 shadow-xs space-y-4",
            itemClassName
          )}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-3.5 w-1/2" />
            </div>
            {hasHeaderIcon && (
              <Skeleton className="size-8 rounded-xs shrink-0 bg-primary/10" />
            )}
          </div>

          {/* Divider / Body */}
          <div className="space-y-2 pt-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>

          {/* Footer action / badge */}
          <div className="pt-2 flex items-center justify-between">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-8 w-24 rounded-xs" />
          </div>
        </div>
      ))}
    </div>
  );
}

