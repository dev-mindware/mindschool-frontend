"use client";
import { suppliersFilters } from "@/types/suppliers";
import { useRouter, useSearchParams } from "next/navigation";

export function useSuppliersFilters() {
  const router = useRouter();
  const query = useSearchParams();

  const filters: suppliersFilters = {
    status: query.get("status") || null,
    sortBy: query.get("sortBy") || null,
    sortOrder: query.get("sortOrder") || null,
    createdAfter: query.get("createdAfter") || null,
    createdBefore: query.get("createdBefore") || null,
  };

  function setFilters(newFilters: Partial<suppliersFilters>) {
    const updated = { ...filters, ...newFilters };
    const searchParams = new URLSearchParams();

    if (updated.status) searchParams.set("status", updated.status);
    if (updated.sortBy) searchParams.set("sortBy", updated.sortBy);
    if (updated.sortOrder) searchParams.set("sortOrder", updated.sortOrder);
    if (updated.createdAfter) searchParams.set("createdAfter", updated.createdAfter);
    if (updated.createdBefore) searchParams.set("createdBefore", updated.createdBefore);
    searchParams.set("page", "1"); // reset page ao trocar filtro

    router.push(`?${searchParams.toString()}`);
  }

  function setPage(page: number) {
    const searchParams = new URLSearchParams(query.toString());
    searchParams.set("page", String(page));
    router.push(`?${searchParams.toString()}`);
  }

  const page = Number(query.get("page")) || 1;

  function clearAllFilters() {
    router.push('?page=1');
  }

  return { filters, setFilters, page, setPage, clearAllFilters };
}
