import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function NotificationItemSkeleton() {
    return (
        <div className="flex items-start gap-3 p-4 relative">
            <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
            <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-start justify-between gap-2">
                    <Skeleton className="h-4 w-48 rounded" />
                    <Skeleton className="h-2 w-2 rounded-full" />
                </div>
                <div className="space-y-1">
                    <Skeleton className="h-4 w-full rounded" />
                    <Skeleton className="h-4 w-2/3 rounded" />
                </div>
                <Skeleton className="h-3 w-24 rounded mt-2" />
            </div>
        </div>
    );
}

export function NotificationListSkeleton({ count = 5 }: { count?: number }) {
    return (
        <div className="bg-card rounded-xl border border-border shadow-sm divide-y divide-border">
            {Array.from({ length: count }).map((_, index) => (
                <NotificationItemSkeleton key={index} />
            ))}
        </div>
    );
}

export function AllNotificationsSkeleton() {
    return (
        <div className="space-y-6">
            {/* TitleList Skeleton */}
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-48 rounded" />
                    <Skeleton className="h-5 w-96 rounded" />
                </div>
                <div className="flex gap-2">
                    <Skeleton className="h-10 w-44 rounded-full" />
                    <Skeleton className="h-10 w-36 rounded-full" />
                </div>
            </div>

            <Skeleton className="h-[1px] w-full" />

            {/* Toolbar Skeleton */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <Skeleton className="h-10 w-full sm:max-w-md rounded-full" />
                <div className="flex gap-2 w-full sm:w-auto">
                    <Skeleton className="h-10 w-24 rounded-full" />
                    <Skeleton className="h-10 w-24 rounded-full" />
                    <Skeleton className="h-10 w-24 rounded-full" />
                </div>
            </div>

            {/* List Skeleton */}
            <NotificationListSkeleton count={8} />
        </div>
    );
}
