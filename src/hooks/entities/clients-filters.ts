"use client";
import { clientsFilters } from "@/types";
import { useRouter, useSearchParams } from "next/navigation";

export function useClientsFilters() {
  const router = useRouter();
  const query = useSearchParams();

  const filters: clientsFilters = {
    status: query.get("status") || null,
    sortBy: query.get("sortBy") || null,
    sortOrder: query.get("sortOrder") || null,
    createdAfter: query.get("createdAfter") || null,
    createdBefore: query.get("createdBefore") || null,
    search: query.get("search-client") || null,
  };

  function setFilters(newFilters: Partial<clientsFilters>) {
    const updated = { ...filters, ...newFilters };
    const searchParams = new URLSearchParams();

    if (updated.status) searchParams.set("status", updated.status);
    if (updated.sortBy) searchParams.set("sortBy", updated.sortBy);
    if (updated.sortOrder) searchParams.set("sortOrder", updated.sortOrder);
    if (updated.createdAfter)
      searchParams.set("createdAfter", updated.createdAfter);
    if (updated.createdBefore)
      searchParams.set("createdBefore", updated.createdBefore);
    if (updated.search) searchParams.set("search-client", updated.search);
    searchParams.set("page", "1");

    router.push(`?${searchParams.toString()}`);
  }

  function setPage(page: number) {
    const searchParams = new URLSearchParams(query.toString());
    searchParams.set("page", String(page));
    router.push(`?${searchParams.toString()}`);
  }

  function clearAllFilters() {
    const searchParams = new URLSearchParams(query.toString());

    searchParams.delete("status");
    searchParams.delete("sortBy");
    searchParams.delete("sortOrder");
    searchParams.delete("createdAfter");
    searchParams.delete("createdBefore");
    searchParams.delete("search-client");
    searchParams.delete("search");
    searchParams.delete("page");

    const qs = searchParams.toString();
    router.push(qs ? `?${qs}` : "?", { scroll: false });
  }

  const page = Number(query.get("page")) || 1;

  return { filters, setFilters, clearAllFilters, page, setPage };
}
