"use client";
import { useCallback, useState } from "react";
import { usePagination } from "../common/use-pagination";
import { useLocalPagination } from "../common/use-local-pagination";
import { Tax } from "@/types";
import { createTaxOptions, sortTaxesNewestFirst } from "@/utils";

export function useGetTaxes() {
  const [taxSearch, setTaxSearchValue] = useState("");
  const search = taxSearch.trim();
  const pagination = usePagination<Tax>({
    endpoint: "/taxes",
    queryKey: "taxes",
    queryParams: {
      sortBy: "rate",
      sortOrder: "desc",
      ...(search ? { search } : {}),
    },
  });

  const taxes = sortTaxesNewestFirst(pagination.data);
  const taxOptions = createTaxOptions(taxes);
  const setTaxSearch = useCallback(
    (value: string) => {
      setTaxSearchValue(value);
      pagination.setPage(1);
    },
    [pagination],
  );

  return {
    ...pagination,
    taxes,
    taxOptions,
    taxSearch,
    setTaxSearch,
    // Backward compatibility match for existing usage
    pagination: {
      page: pagination.page,
      totalPages: pagination.totalPages,
    },
  };
}

export function useTaxesSelect() {
  const [taxSearch, setTaxSearchValue] = useState("");
  const search = taxSearch.trim();
  const pagination = useLocalPagination<Tax>({
    endpoint: "/taxes",
    queryKey: "taxes_select",
    queryParams: {
      sortBy: "rate",
      sortOrder: "desc",
      ...(search ? { search } : {}),
    },
  });

  const taxes = sortTaxesNewestFirst(pagination.data);
  const taxOptions = createTaxOptions(taxes);
  const setTaxSearch = useCallback(
    (value: string) => {
      setTaxSearchValue(value);
      pagination.setPage(1);
    },
    [pagination],
  );

  return {
    ...pagination,
    taxes,
    taxOptions,
    taxSearch,
    setTaxSearch,
    pagination: {
      page: pagination.page,
      totalPages: pagination.totalPages,
    },
  };
}
