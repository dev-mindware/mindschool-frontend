"use client";

import { TitleList } from "@/components/common";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
    Card,
    CardContent,
    CardHeader,
} from "@/components/ui/card";

export function ClientsReportsSkeleton() {
    return (
        <div className="space-y-6">
            <TitleList
                title="Relatórios de Clientes"
                suTitle="Análise de Clientes"
            />

            {/* Filters Skeleton */}
            <div className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="space-y-2">
                            <Skeleton className="h-3 w-16" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    ))}
                </div>
            </div>

            <Separator />

            {/* Pie Chart + Top Client Grid Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {/* Pie Chart Skeleton */}
                <Card className="col-span-2">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-5 w-5 rounded-md" />
                            <Skeleton className="h-6 w-48" />
                        </div>
                        <Skeleton className="h-4 w-64" />
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col items-center justify-center space-y-8" style={{ height: 350 }}>
                            <Skeleton className="h-[200px] w-[200px] rounded-full" />
                            <div className="flex gap-6">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <Skeleton className="h-3 w-3 rounded-full" />
                                        <Skeleton className="h-4 w-20" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="text-center space-y-2">
                                    <Skeleton className="h-3 w-20 mx-auto" />
                                    <Skeleton className="h-6 w-28 mx-auto" />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Top Client Card Skeleton */}
                <Card className="border-2 border-primary/10">
                    <CardHeader>
                        <div className="flex items-start justify-between">
                            <div className="space-y-3 flex-1">
                                <div className="space-y-1">
                                    <Skeleton className="h-7 w-32" />
                                    <Skeleton className="h-5 w-24" />
                                </div>
                                <div className="space-y-1">
                                    <Skeleton className="h-3 w-48" />
                                    <Skeleton className="h-3 w-32" />
                                </div>
                            </div>
                            <Skeleton className="h-12 w-12 rounded-full" />
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="space-y-1">
                                        <Skeleton className="h-3 w-16" />
                                        <Skeleton className="h-5 w-full" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <Separator />

                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Skeleton className="h-4 w-36" />
                                <Skeleton className="h-5 w-12" />
                            </div>
                            <Skeleton className="h-2 w-full rounded-full" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tables Grid Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[1, 2].map((cardIndex) => (
                    <Card key={cardIndex}>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-5 w-5 rounded-md" />
                                <Skeleton className="h-6 w-40" />
                            </div>
                            <Skeleton className="h-4 w-56" />
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between pb-2 border-b">
                                    <Skeleton className="h-4 w-20" />
                                    <Skeleton className="h-4 w-20" />
                                    <Skeleton className="h-4 w-20" />
                                </div>
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div key={i} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Skeleton className="h-8 w-8 rounded-full" />
                                            <div className="space-y-1">
                                                <Skeleton className="h-4 w-32" />
                                                <Skeleton className="h-3 w-20" />
                                            </div>
                                        </div>
                                        <Skeleton className="h-4 w-24" />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
