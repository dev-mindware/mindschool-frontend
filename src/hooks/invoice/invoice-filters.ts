"use client";

import { InvoiceFilters } from "@/types";
import { useRouter, useSearchParams } from "next/navigation";

export function useInvoiceFilters(prefix: string) {
  const router = useRouter();
  const query = useSearchParams();

  const getKey = (key: string) => `${prefix}_${key}`;

  const filters: InvoiceFilters = {
    status: (query.get(getKey("status")) as InvoiceFilters["status"]) || null,
    sortBy: query.get(getKey("sortBy")) || null,
    sortOrder: query.get(getKey("sortOrder")) || null,
    invoiceNumber: query.get(getKey("invoiceNumber")) || null,
    clientName: query.get(getKey("clientName")) || null,
    startDate: query.get(getKey("startDate")) || null,
    endDate: query.get(getKey("endDate")) || null,
  };

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

    updateParam(searchParams, getKey("status"), newFilters.status);
    updateParam(searchParams, getKey("sortBy"), newFilters.sortBy);
    updateParam(searchParams, getKey("sortOrder"), newFilters.sortOrder);
    updateParam(
      searchParams,
      getKey("invoiceNumber"),
      newFilters.invoiceNumber
    );
    updateParam(searchParams, getKey("clientName"), newFilters.clientName);
    updateParam(searchParams, getKey("startDate"), newFilters.startDate);
    updateParam(searchParams, getKey("endDate"), newFilters.endDate);

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

    searchParams.delete(getKey("status"));
    searchParams.delete(getKey("sortBy"));
    searchParams.delete(getKey("sortOrder"));
    searchParams.delete(getKey("invoiceNumber"));
    searchParams.delete(getKey("clientName"));
    searchParams.delete(getKey("startDate"));
    searchParams.delete(getKey("endDate"));
    searchParams.delete(getKey("page"));
    searchParams.delete(`search_${prefix}`); // limpa o search também

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
