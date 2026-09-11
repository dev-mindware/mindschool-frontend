"use client";
import { useState } from "react";
import { CategoryFilters } from "@/types";
import { useRouter, useSearchParams } from "next/navigation";

export function useCategoryFilters() {
  const router = useRouter();
  const query = useSearchParams();
  const [viewMode, setViewMode] = useState<"card" | "table">("table");

  const filters: CategoryFilters = {
    isActive: query.get("isActive") || null,
    sortBy: query.get("sortBy") || null,
    sortOrder: query.get("sortOrder") || null,
  };

  function setFilters(newFilters: Partial<CategoryFilters>) {
    const updated = { ...filters, ...newFilters };
    const searchParams = new URLSearchParams();

    if (updated.isActive) searchParams.set("isActive", updated.isActive);
    if (updated.sortBy) searchParams.set("sortBy", updated.sortBy);
    if (updated.sortOrder) searchParams.set("sortOrder", updated.sortOrder);
    searchParams.set("page", "1");

    router.push(`?${searchParams.toString()}`);
  }

  function clearAllFilters() {
    const searchParams = new URLSearchParams(query.toString());

    searchParams.delete("isActive");
    searchParams.delete("sortBy");
    searchParams.delete("sortOrder");
    searchParams.delete("page");
    searchParams.delete("search_category");

    router.push(`?${searchParams.toString()}`, { scroll: false });
  }

  function setPage(page: number) {
    const searchParams = new URLSearchParams(query.toString());
    searchParams.set("page", String(page));
    router.push(`?${searchParams.toString()}`);
  }

  const page = Number(query.get("page")) || 1;

  return { filters, setFilters, clearAllFilters, viewMode, setViewMode, page, setPage };
}
