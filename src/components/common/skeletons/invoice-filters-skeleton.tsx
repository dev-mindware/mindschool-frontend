import { Skeleton } from "@/components/ui";

export function InvoiceFiltersSkeleton() {
    return (
        <div className="w-full flex flex-col gap-4 px-2 sm:px-0">
            {/* Search Input and Client Input */}
            <div className="w-full flex flex-col gap-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>

                {/* Filter Popovers - 4 columns on desktop */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
            </div>

            {/* Date Pickers */}
            <div className="flex justify-center sm:justify-start">
                <div className="grid grid-cols-2 gap-3">
                    <Skeleton className="h-10 w-32" />
                    <Skeleton className="h-10 w-32" />
                </div>
            </div>
        </div>
    );
}
