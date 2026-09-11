"use client";

import { CreditNoteFilters } from "@/types/credit-note";
import { useRouter, useSearchParams } from "next/navigation";

export function useCreditNotesFilters() {
  const router = useRouter();
  const query = useSearchParams();

  const filters: CreditNoteFilters = {
    creditNoteNumber: query.get("creditNoteNumber") || null,
    reason: query.get("reason") || null,
    sortBy: query.get("sortBy") || null,
    sortOrder: query.get("sortOrder") || null,
    startDate: query.get("startDate") || null,
    endDate: query.get("endDate") || null,
  };

  const page = Number(query.get("page")) || 1;

  function updateParam(
    searchParams: URLSearchParams,
    key: string,
    value: string | number | null | undefined
  ) {
    if (value === undefined) return;

    if (value === null || value === "") {
      searchParams.delete(key);
      return;
    }

    searchParams.set(key, String(value));
  }

  function setFilters(newFilters: Partial<CreditNoteFilters>) {
    const searchParams = new URLSearchParams(query.toString());

    updateParam(searchParams, "creditNoteNumber", newFilters.creditNoteNumber);
    updateParam(searchParams, "reason", newFilters.reason);
    updateParam(searchParams, "sortBy", newFilters.sortBy);
    updateParam(searchParams, "sortOrder", newFilters.sortOrder);
    updateParam(searchParams, "startDate", newFilters.startDate);
    updateParam(searchParams, "endDate", newFilters.endDate);

    if (Object.keys(newFilters).length > 0) {
      searchParams.set("page", "1");
    }

    router.push(`?${searchParams.toString()}`, { scroll: false });
  }

  function setPage(newPage: number) {
    const searchParams = new URLSearchParams(query.toString());
    searchParams.set("page", String(newPage));
    router.push(`?${searchParams.toString()}`, { scroll: false });
  }

  function clearAllFilters() {
    const searchParams = new URLSearchParams(query.toString());

    searchParams.delete("creditNoteNumber");
    searchParams.delete("reason");
    searchParams.delete("sortBy");
    searchParams.delete("sortOrder");
    searchParams.delete("startDate");
    searchParams.delete("endDate");

    router.push(`?${searchParams.toString()}`, { scroll: false });
  }

  return {
    filters,
    setFilters,
    page,
    setPage,
    clearAllFilters,
  };
}
