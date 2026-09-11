"use client";

import { Card, CardContent, Skeleton } from "@/components";

export function PosCardSkeleton() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="shadow-none border-muted-foreground/10">
                    <CardContent className="p-5 space-y-6">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <Skeleton className="w-16 h-16 rounded-xl" />
                                <div className="space-y-2">
                                    <Skeleton className="h-5 w-24" />
                                    <Skeleton className="h-4 w-16 rounded-full" />
                                </div>
                            </div>
                            <Skeleton className="h-8 w-8 rounded-md" />
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Skeleton className="h-2.5 w-20" />
                                <Skeleton className="h-4 w-40" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Skeleton className="h-2.5 w-12" />
                                    <Skeleton className="h-7 w-20" />
                                </div>
                                <div className="space-y-2">
                                    <Skeleton className="h-2.5 w-12" />
                                    <Skeleton className="h-7 w-16" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-end">
                                <Skeleton className="h-2.5 w-16" />
                                <Skeleton className="h-3 w-8" />
                            </div>
                            <Skeleton className="h-1.5 w-full rounded-full" />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
