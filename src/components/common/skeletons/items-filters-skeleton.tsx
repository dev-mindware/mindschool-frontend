import { Skeleton } from "@/components/ui";

export function ItemsFiltersSkeleton() {
    return (
        <div className="w-full flex flex-col gap-4 px-2 sm:px-0">
            {/* Search Input and Category Select */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-baseline">
                <Skeleton className="h-10 w-full sm:flex-1" />
                <Skeleton className="h-10 w-full sm:w-48" />
            </div>

            {/* Filters Grid - 6 columns on desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-6 gap-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
        </div>
    );
}
