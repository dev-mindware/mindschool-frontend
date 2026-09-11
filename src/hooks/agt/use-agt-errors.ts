"use client";

import { usePagination } from "@/hooks/common";
import type { AgtError } from "@/types";

export function useAgtErrors(
  params: {
    invoiceId?: string;
    search?: string;
    origin?: string;
    severity?: string;
  } = {},
  enabled = true,
) {
  return usePagination<AgtError>({
    endpoint: "/agt/errors",
    queryKey: ["agt-errors"],
    queryParams: {
      ...params,
      limit: 10,
    },
    enabled,
  });
}
