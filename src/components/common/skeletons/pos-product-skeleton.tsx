"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function PosProductCardSkeleton() {
  return (
    <Card className="overflow-hidden flex flex-col py-0 border-border/50 bg-card/50">
      <CardContent className="p-4 flex-1 flex flex-col gap-3">
        <div className="flex gap-3.5">
          <Skeleton className="h-16 w-16 rounded-xl shrink-0" />
          <div className="flex flex-col justify-between py-0.5 flex-1 gap-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-4 w-20 rounded-full" />
          </div>
        </div>
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-border/40">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      </CardContent>
    </Card>
  );
}

export function PosProductSectionSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <PosProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
