"use client";

import { InvoiceFilters } from "@/types";
import { useRouter, useSearchParams } from "next/navigation";

export function useBankFilters(prefix: string) {
  const router = useRouter();
  const query = useSearchParams();

  const getKey = (key: string) => `${prefix}_${key}`;

  const page = Number(query.get(getKey("page"))) || 1;

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

  function setFilters(newFilters: Partial<InvoiceFilters>) {
    const searchParams = new URLSearchParams(query.toString());


    if (Object.keys(newFilters).length > 0) {
      searchParams.set(getKey("page"), "1");
    }

    router.push(`?${searchParams.toString()}`, { scroll: false });
  }

  function setPage(newPage: number) {
    const searchParams = new URLSearchParams(query.toString());
    searchParams.set(getKey("page"), String(newPage));
    router.push(`?${searchParams.toString()}`, { scroll: false });
  }

  function clearAllFilters() {
    const searchParams = new URLSearchParams(query.toString());

    searchParams.delete(getKey("page"));
    searchParams.delete(`search_${prefix}`);

    router.push(`?${searchParams.toString()}`, { scroll: false });
  }

  return {
    setFilters,
    page,
    setPage,
    clearAllFilters,
  };
}
