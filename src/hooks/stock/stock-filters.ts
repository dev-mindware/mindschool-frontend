"use client";
import { useState } from "react";
import { stockFilters } from "@/types/stock-filters";
import { useRouter, useSearchParams } from "next/navigation";

export function useStockFilters() {
  const router = useRouter();
  const query = useSearchParams();

  const filters: stockFilters = {
    sortBy: query.get("sortBy") || undefined,
    sortOrder: query.get("sortOrder") || undefined,
    itemsId: query.get("itemsId") || undefined,
    storeId: query.get("storeId") || undefined,
    minQuantity: query.get("minQuantity")
      ? Number(query.get("minQuantity"))
      : undefined,
    maxQuantity: query.get("maxQuantity")
      ? Number(query.get("maxQuantity"))
      : undefined,
    minAvailable: query.get("minAvailable")
      ? Number(query.get("minAvailable"))
      : undefined,
    maxAvailable: query.get("maxAvailable")
      ? Number(query.get("maxAvailable"))
      : undefined,
    hasReserved:
      query.get("hasReserved") === "true"
        ? true
        : query.get("hasReserved") === "false"
        ? false
        : undefined,
    lowStock:
      query.get("lowStock") === "true"
        ? true
        : query.get("lowStock") === "false"
        ? false
        : undefined,
    outOfStock:
      query.get("outOfStock") === "true"
        ? true
        : query.get("outOfStock") === "false"
        ? false
        : undefined,
    includeItem:
      query.get("includeItem") === "true"
        ? true
        : query.get("includeItem") === "false"
        ? false
        : undefined,
    includeStore:
      query.get("includeStore") === "true"
        ? true
        : query.get("includeStore") === "false"
        ? false
        : undefined,
    createdAfter: query.get("createdAfter") || undefined,
    createdBefore: query.get("createdBefore") || undefined,
  };

  function setFilters(newFilters: Partial<stockFilters>) {
    const updated = { ...filters, ...newFilters };
    const searchParams = new URLSearchParams();

    if (updated.sortBy) searchParams.set("sortBy", updated.sortBy);
    if (updated.sortOrder) searchParams.set("sortOrder", updated.sortOrder);
    if (updated.itemsId) searchParams.set("itemsId", updated.itemsId);
    if (updated.storeId) searchParams.set("storeId", updated.storeId);

    // Number filters
    if (updated.minQuantity !== undefined && updated.minQuantity !== null) {
      searchParams.set("minQuantity", String(updated.minQuantity));
    }
    if (updated.maxQuantity !== undefined && updated.maxQuantity !== null) {
      searchParams.set("maxQuantity", String(updated.maxQuantity));
    }
    if (updated.minAvailable !== undefined && updated.minAvailable !== null) {
      searchParams.set("minAvailable", String(updated.minAvailable));
    }
    if (updated.maxAvailable !== undefined && updated.maxAvailable !== null) {
      searchParams.set("maxAvailable", String(updated.maxAvailable));
    }

    // Boolean filters - only set if explicitly true or false
    if (updated.hasReserved === true || updated.hasReserved === false) {
      searchParams.set("hasReserved", String(updated.hasReserved));
    }
    if (updated.lowStock === true || updated.lowStock === false) {
      searchParams.set("lowStock", String(updated.lowStock));
    }
    if (updated.outOfStock === true || updated.outOfStock === false) {
      searchParams.set("outOfStock", String(updated.outOfStock));
    }
    if (updated.includeItem === true || updated.includeItem === false) {
      searchParams.set("includeItem", String(updated.includeItem));
    }
    if (updated.includeStore === true || updated.includeStore === false) {
      searchParams.set("includeStore", String(updated.includeStore));
    }

    // Date filters - convert to ISO format with timezone
    if (updated.createdAfter && updated.createdAfter !== "") {
      const date = new Date(updated.createdAfter);
      if (!isNaN(date.getTime())) {
        date.setHours(0, 0, 0, 0);
        searchParams.set("createdAfter", date.toISOString());
      }
    }
    if (updated.createdBefore && updated.createdBefore !== "") {
      const date = new Date(updated.createdBefore);
      if (!isNaN(date.getTime())) {
        date.setHours(23, 59, 59, 999);
        searchParams.set("createdBefore", date.toISOString());
      }
    }

    searchParams.set("page", "1");
    router.push(`?${searchParams.toString()}`);
  }

  function clearAllFilters() {
    const searchParams = new URLSearchParams(query.toString());

    searchParams.delete("sortBy");
    searchParams.delete("sortOrder");
    searchParams.delete("itemsId");
    searchParams.delete("storeId");
    searchParams.delete("minQuantity");
    searchParams.delete("maxQuantity");
    searchParams.delete("minAvailable");
    searchParams.delete("maxAvailable");
    searchParams.delete("hasReserved");
    searchParams.delete("lowStock");
    searchParams.delete("outOfStock");
    searchParams.delete("includeItem");
    searchParams.delete("includeStore");
    searchParams.delete("createdAfter");
    searchParams.delete("createdBefore");
    searchParams.delete("page");

    router.push(`?${searchParams.toString()}`, { scroll: false });
  }

  function setPage(page: number) {
    const searchParams = new URLSearchParams(query.toString());
    searchParams.set("page", String(page));
    router.push(`?${searchParams.toString()}`);
  }

  const page = Number(query.get("page")) || 1;

  return { filters, setFilters, clearAllFilters, page, setPage };
}
