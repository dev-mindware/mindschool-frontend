"use client";
import { CashSessionFilters } from "@/types/cash-session";
import { useRouter, useSearchParams } from "next/navigation";

export function useCashSessionFilters() {
  const router = useRouter();
  const query = useSearchParams();

  const filters: CashSessionFilters = {
    storeId: query.get("storeId") || null,
    search: query.get("search") || null,
    isOpen: query.get("isOpen") || null,
    sortBy: query.get("sortBy") || null,
    sortOrder: query.get("sortOrder") || null,
    openedAfter: query.get("openedAfter") || null,
    openedBefore: query.get("openedBefore") || null,
  };

  function setFilters(newFilters: Partial<CashSessionFilters>) {
    const updated = { ...filters, ...newFilters };
    const searchParams = new URLSearchParams(query.toString());

    if (updated.storeId) searchParams.set("storeId", updated.storeId);
    else searchParams.delete("storeId");

    if (updated.search) searchParams.set("search", updated.search);
    else searchParams.delete("search");

    if (updated.isOpen !== null && updated.isOpen !== undefined)
      searchParams.set("isOpen", updated.isOpen);
    else searchParams.delete("isOpen");

    if (updated.sortBy) searchParams.set("sortBy", updated.sortBy);
    else searchParams.delete("sortBy");

    if (updated.sortOrder) searchParams.set("sortOrder", updated.sortOrder);
    else searchParams.delete("sortOrder");

    if (updated.openedAfter)
      searchParams.set("openedAfter", updated.openedAfter);
    else searchParams.delete("openedAfter");

    if (updated.openedBefore)
      searchParams.set("openedBefore", updated.openedBefore);
    else searchParams.delete("openedBefore");

    searchParams.set("page", "1"); // reset page ao trocar filtro

    router.push(`?${searchParams.toString()}`);
  }

  function setPage(page: number) {
    const searchParams = new URLSearchParams(query.toString());
    searchParams.set("page", String(page));
    router.push(`?${searchParams.toString()}`);
  }

  function clearAllFilters() {
    const searchParams = new URLSearchParams();
    router.push(`?${searchParams.toString()}`, { scroll: false });
  }

  const page = Number(query.get("page")) || 1;

  return { filters, setFilters, page, setPage, clearAllFilters };
}
