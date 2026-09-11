export function PosRequestsSkeleton() {
    return (
        <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, idx) => (
                <div
                    key={idx}
                    className="p-4 flex items-start gap-4 rounded-xl border border-muted-foreground/10"
                >
                    <div className="w-10 h-10 rounded-lg bg-muted animate-pulse shrink-0" />
                    <div className="space-y-2 flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                            <div className="space-y-1 w-full">
                                <div className="h-4 w-1/3 bg-muted animate-pulse rounded" />
                                <div className="h-3 w-3/4 bg-muted animate-pulse rounded" />
                            </div>
                            <div className="h-3 w-16 bg-muted animate-pulse rounded" />
                        </div>
                        <div className="flex items-center gap-2 pt-1">
                            <div className="h-8 w-20 bg-muted animate-pulse rounded" />
                            <div className="h-8 w-20 bg-muted animate-pulse rounded" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
