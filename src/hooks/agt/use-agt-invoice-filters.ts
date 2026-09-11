"use client";

import { format } from "date-fns";
import { useRouter, useSearchParams } from "next/navigation";
import type { AgtInvoiceFilters } from "@/types";

const DEFAULT_START = format(
  new Date(new Date().setDate(new Date().getDate() - 30)),
  "yyyy-MM-dd",
);
const DEFAULT_END = format(new Date(), "yyyy-MM-dd");

export function useAgtInvoiceFilters() {
  const router = useRouter();
  const query = useSearchParams();

  const filters: AgtInvoiceFilters = {
    queryStartDate: query.get("queryStartDate") || DEFAULT_START,
    queryEndDate: query.get("queryEndDate") || DEFAULT_END,
    documentType: query.get("documentType") || "ALL",
  };

  const page = Number(query.get("page")) || 1;

  function setFilters(newFilters: Partial<AgtInvoiceFilters>) {
    const searchParams = new URLSearchParams(query.toString());
    const updated = { ...filters, ...newFilters };

    if (updated.queryStartDate) {
      searchParams.set("queryStartDate", updated.queryStartDate);
    } else {
      searchParams.delete("queryStartDate");
    }

    if (updated.queryEndDate) {
      searchParams.set("queryEndDate", updated.queryEndDate);
    } else {
      searchParams.delete("queryEndDate");
    }

    if (updated.documentType && updated.documentType !== "ALL") {
      searchParams.set("documentType", updated.documentType);
    } else {
      searchParams.delete("documentType");
    }

    searchParams.set("page", "1");
    router.push(`?${searchParams.toString()}`, { scroll: false });
  }

  function setPage(newPage: number) {
    const searchParams = new URLSearchParams(query.toString());
    searchParams.set("page", String(newPage));
    router.push(`?${searchParams.toString()}`, { scroll: false });
  }

  function clearAllFilters() {
    const searchParams = new URLSearchParams(query.toString());
    searchParams.delete("queryStartDate");
    searchParams.delete("queryEndDate");
    searchParams.delete("documentType");
    searchParams.delete("page");
    router.push(`?${searchParams.toString()}`, { scroll: false });
  }

  return { filters, setFilters, page, setPage, clearAllFilters };
}
