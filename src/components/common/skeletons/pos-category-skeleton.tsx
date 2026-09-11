"use client";

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function PosCategorySkeleton() {
    return (
        <div className="w-full mb-6 relative">
            <div className="flex items-center gap-2 overflow-hidden px-1">
                {/* Previous Button Placeholder (hidden on mobile) */}
                <Skeleton className="h-8 w-8 shrink-0 rounded-full hidden md:block" />

                <div className="flex-1 flex space-x-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div
                            key={i}
                            className="flex items-center gap-3 px-4 py-3 rounded-md border border-border/50 min-w-[140px] shrink-0 bg-card/50"
                        >
                            <Skeleton className="h-9 w-9 rounded-lg shrink-0" />
                            <div className="flex flex-col gap-2">
                                <Skeleton className="h-4 w-16" />
                                <Skeleton className="h-3 w-10" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Next Button Placeholder (hidden on mobile) */}
                <Skeleton className="h-8 w-8 shrink-0 rounded-full hidden md:block" />
            </div>
        </div>
    );
}
