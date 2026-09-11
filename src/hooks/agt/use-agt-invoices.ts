"use client";

import { usePagination } from "@/hooks/common";
import type { AgtInvoice } from "@/types";
import { useAgtInvoiceFilters } from "./use-agt-invoice-filters";

export function useAgtInvoices(enabled = true) {
  const { filters } = useAgtInvoiceFilters();

  const documentType =
    filters.documentType && filters.documentType !== "ALL"
      ? filters.documentType
      : undefined;

  return usePagination<AgtInvoice>({
    endpoint: "/agt/invoices",
    queryKey: ["agt-invoices"],
    queryParams: {
      queryStartDate: filters.queryStartDate,
      queryEndDate: filters.queryEndDate,
      documentType,
      limit: 10,
    },
    enabled,
  });
}
