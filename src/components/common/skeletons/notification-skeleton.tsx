import { Skeleton } from "@/components/ui/skeleton";

export function NotificationItemSkeleton() {
    return (
        <div className="flex items-start gap-3 p-3.5 sm:p-4 relative">
            <Skeleton className="size-9 sm:size-10 rounded-full shrink-0" />
            <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-start justify-between gap-2">
                    <Skeleton className="h-4 w-48 max-w-[75%] rounded-xs" />
                    <Skeleton className="size-2 rounded-full shrink-0 mt-1" />
                </div>
                <div className="space-y-1.5">
                    <Skeleton className="h-3.5 w-full rounded-xs" />
                    <Skeleton className="h-3.5 w-2/3 rounded-xs" />
                </div>
                <Skeleton className="h-3 w-24 rounded-xs mt-1.5" />
            </div>
        </div>
    );
}

export function NotificationListSkeleton({ count = 5 }: { count?: number }) {
    return (
        <div className="bg-card rounded-xs border border-border shadow-xs divide-y divide-border">
            {Array.from({ length: count }).map((_, index) => (
                <NotificationItemSkeleton key={index} />
            ))}
        </div>
    );
}

export function AllNotificationsSkeleton() {
    return (
        <div className="space-y-6 animate-in fade-in duration-200">
            {/* TitleList Skeleton */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1.5">
                    <Skeleton className="h-7 sm:h-8 w-48 rounded-xs" />
                    <Skeleton className="h-4 w-80 max-w-full rounded-xs" />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Skeleton className="h-9 w-40 rounded-xs" />
                    <Skeleton className="h-9 w-32 rounded-xs" />
                </div>
            </div>

            <div className="h-px w-full bg-border/60" />

            {/* Toolbar Skeleton */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                <Skeleton className="h-9 w-full sm:max-w-sm rounded-xs" />
                <div className="flex items-center gap-2 overflow-x-auto">
                    <Skeleton className="h-9 w-24 rounded-xs shrink-0" />
                    <Skeleton className="h-9 w-24 rounded-xs shrink-0" />
                    <Skeleton className="h-9 w-24 rounded-xs shrink-0" />
                </div>
            </div>

            {/* List Skeleton */}
            <NotificationListSkeleton count={8} />
        </div>
    );
}
