"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { DynamicMetricCardSkeleton } from "./dynamic-metric-card-skeleton";

export function DashboardSkeleton() {
    return (
        <div className="flex flex-col gap-4 md:gap-6 animate-in fade-in duration-300">
            {/* 1. Summary Metric Cards (4 cards) */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4 @5xl/main:grid-cols-4">
                {Array.from({ length: 4 }).map((_, idx) => (
                    <DynamicMetricCardSkeleton key={idx} />
                ))}
            </div>

            {/* 2. Charts Section (Financial Area Chart + Sales Donut) */}
            <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-3">
                {/* Financial Area Chart Skeleton */}
                <Card className="lg:col-span-2 flex flex-col gap-0 py-4 border shadow-none">
                    <CardHeader className="flex flex-row items-start justify-between gap-2 px-4 pb-3">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Skeleton className="size-8 rounded-md bg-primary/10" />
                                <Skeleton className="h-5 w-40" />
                            </div>
                            <Skeleton className="h-3.5 w-28 ml-10" />
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 px-4 pt-2">
                        <div className="relative h-[280px] w-full flex flex-col justify-between py-3">
                            <div className="absolute inset-0 flex flex-col justify-between py-2">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="w-full h-px bg-muted/40" />
                                ))}
                            </div>
                            <Skeleton className="h-full w-full bg-gradient-to-t from-primary/10 via-primary/5 to-transparent rounded-lg" />
                        </div>
                        <div className="flex justify-center gap-6 mt-4">
                            <div className="flex items-center gap-2">
                                <Skeleton className="size-3 rounded-full bg-primary/40" />
                                <Skeleton className="h-3 w-16" />
                            </div>
                            <div className="flex items-center gap-2">
                                <Skeleton className="size-3 rounded-full bg-destructive/40" />
                                <Skeleton className="h-3 w-16" />
                            </div>
                            <div className="flex items-center gap-2">
                                <Skeleton className="size-3 rounded-full bg-green-500/40" />
                                <Skeleton className="h-3 w-16" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Sales Donut Skeleton */}
                <Card className="flex flex-col gap-0 py-4 border shadow-none">
                    <CardHeader className="px-4 pb-2">
                        <CardTitle className="flex items-center gap-2">
                            <Skeleton className="size-8 rounded-md bg-primary/10" />
                            <Skeleton className="h-5 w-32" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-1 flex-col justify-center items-center px-4">
                        <div className="relative size-[190px] flex items-center justify-center my-2">
                            <div className="absolute inset-0 rounded-full border-[18px] border-muted/30 animate-pulse" />
                            <div className="flex flex-col items-center justify-center gap-1.5">
                                <Skeleton className="h-7 w-16 rounded-md" />
                                <Skeleton className="h-3 w-12" />
                            </div>
                        </div>
                        <div className="mt-4 flex flex-col gap-2.5 w-full">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Skeleton className="size-2.5 rounded-full bg-primary/60" />
                                    <Skeleton className="h-3.5 w-20" />
                                </div>
                                <Skeleton className="h-3.5 w-24" />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Skeleton className="size-2.5 rounded-full bg-primary/30" />
                                    <Skeleton className="h-3.5 w-20" />
                                </div>
                                <Skeleton className="h-3.5 w-24" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* 3. Operational Cards (Clients + Receivables + Stock) */}
            <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-3">
                {/* Clients Card Skeleton */}
                <Card className="p-4 border shadow-none flex flex-col justify-between space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Skeleton className="size-8 rounded-md bg-primary/10" />
                            <Skeleton className="h-5 w-24" />
                        </div>
                        <Skeleton className="h-4 w-12" />
                    </div>
                    <ul className="space-y-3.5">
                        <li className="flex items-center justify-between">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-4 w-12" />
                        </li>
                        <li className="flex items-center justify-between">
                            <Skeleton className="h-4 w-28" />
                            <Skeleton className="h-4 w-16" />
                        </li>
                        <li className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <Skeleton className="h-4 w-36" />
                                <Skeleton className="h-4 w-10" />
                            </div>
                            <Skeleton className="h-1.5 w-full rounded-full" />
                        </li>
                        <li className="flex items-center justify-between">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-4 w-14" />
                        </li>
                    </ul>
                </Card>

                {/* Receivables Card Skeleton */}
                <Card className="p-4 border shadow-none flex flex-col justify-between space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Skeleton className="size-8 rounded-md bg-primary/10" />
                            <Skeleton className="h-5 w-36" />
                        </div>
                        <Skeleton className="h-4 w-12" />
                    </div>
                    <div>
                        <Skeleton className="h-8 w-32 mb-3" />
                        <Skeleton className="h-2 w-full rounded-full mb-4" />
                        <ul className="space-y-2.5">
                            {[1, 2, 3].map((i) => (
                                <li key={i} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Skeleton className="size-2 rounded-full" />
                                        <Skeleton className="h-3.5 w-24" />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Skeleton className="h-3.5 w-16" />
                                        <Skeleton className="h-3 w-8" />
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </Card>

                {/* Stock Card Skeleton */}
                <Card className="p-4 border shadow-none flex flex-col justify-between space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Skeleton className="size-8 rounded-md bg-primary/10" />
                            <Skeleton className="h-5 w-20" />
                        </div>
                        <Skeleton className="h-4 w-12" />
                    </div>
                    <div>
                        <Skeleton className="h-3 w-24 mb-1" />
                        <Skeleton className="h-8 w-36 mb-4" />
                        <ul className="space-y-2.5">
                            {[1, 2, 3].map((i) => (
                                <li key={i} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Skeleton className="size-2 rounded-full" />
                                        <Skeleton className="h-3.5 w-24" />
                                    </div>
                                    <Skeleton className="h-3.5 w-12" />
                                </li>
                            ))}
                        </ul>
                    </div>
                </Card>
            </div>

            {/* 4. Activity & Monthly Goal Section */}
            <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-3">
                {/* Recent Activity Skeleton */}
                <Card className="lg:col-span-2 p-4 border shadow-none">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Skeleton className="size-8 rounded-md bg-primary/10" />
                            <Skeleton className="h-5 w-36" />
                        </div>
                        <Skeleton className="h-4 w-16" />
                    </div>
                    <ul className="divide-y divide-border">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <li key={i} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                                <Skeleton className="size-8 rounded-md shrink-0" />
                                <Skeleton className="h-4 flex-1" />
                                <Skeleton className="h-4 w-20 shrink-0" />
                                <Skeleton className="h-3 w-16 shrink-0" />
                            </li>
                        ))}
                    </ul>
                </Card>

                {/* Monthly Goal Skeleton */}
                <Card className="p-4 border shadow-none flex flex-col justify-between">
                    <div className="flex items-center gap-2 mb-2">
                        <Skeleton className="size-8 rounded-md bg-primary/10" />
                        <Skeleton className="h-5 w-32" />
                    </div>
                    <div className="flex items-center gap-4 py-2">
                        <div className="relative size-24 shrink-0 flex items-center justify-center">
                            <div className="size-20 rounded-full border-8 border-muted/40 animate-pulse" />
                            <Skeleton className="h-5 w-10 absolute" />
                        </div>
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-5 w-32" />
                            <Skeleton className="h-3.5 w-24" />
                            <Skeleton className="h-4 w-16" />
                        </div>
                    </div>
                    <Skeleton className="h-3 w-40" />
                </Card>
            </div>
        </div>
    );
}
