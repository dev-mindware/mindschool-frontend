"use client";

import { usePagination } from "@/hooks/common";
import type { AgtSeries } from "@/types";

export function useAgtSeries(enabled = true) {
  return usePagination<AgtSeries>({
    endpoint: "/agt/series",
    queryKey: ["agt-series"],
    enabled,
  });
}
