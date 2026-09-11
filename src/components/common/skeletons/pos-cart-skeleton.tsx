"use client";

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function PosCartSkeleton() {
    return (
        <div className="flex flex-col bg-sidebar rounded-md shadow-sm p-6 m-4 border border-border/50 h-full">
            <Skeleton className="h-7 w-32 mb-6" />

            <div className="flex-1 space-y-4 mb-8">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex gap-3 items-center">
                        <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-3 w-16" />
                        </div>
                        <Skeleton className="h-5 w-16 shrink-0 ml-2" />
                    </div>
                ))}
            </div>

            <div className="mt-auto space-y-4 pt-6 border-t border-border/50">
                <div className="space-y-3">
                    <div className="flex justify-between">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-20" />
                    </div>
                    <div className="flex justify-between">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-20" />
                    </div>
                    <div className="flex justify-between pt-2">
                        <Skeleton className="h-6 w-16" />
                        <Skeleton className="h-6 w-24" />
                    </div>
                </div>
                <Skeleton className="h-10 w-full rounded-md mt-4" />
            </div>
        </div>
    );
}
