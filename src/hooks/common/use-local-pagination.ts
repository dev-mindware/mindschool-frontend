"use client";
import { useState } from "react";
import { api } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { PaginationResponse } from "./use-pagination";

interface UseLocalPaginatedFetchOptions {
  endpoint: string;
  queryKey: string[] | string;
  queryParams?: Record<string, any>;
  enabled?: boolean;
  keepPreviousData?: boolean;
}

export function useLocalPagination<T>({
  endpoint,
  queryKey,
  queryParams = {},
  enabled = true,
  keepPreviousData = true,
}: UseLocalPaginatedFetchOptions) {
  const [page, setPage] = useState(1);

  const query = useQuery<PaginationResponse<T>>({
    queryKey: Array.isArray(queryKey)
      ? [...queryKey, page, queryParams]
      : [queryKey, page, queryParams],
    queryFn: async () => {
      const response = await api.get(endpoint, {
        params: { page, ...queryParams },
      });

      const raw = response.data;

      // Handle direct array response
      if (Array.isArray(raw)) {
        return {
          data: raw as T[],
          total: raw.length,
          page: page,
          limit: queryParams.limit ?? Math.max(raw.length, 10),
          totalPages: 1,
        } satisfies PaginationResponse<T>;
      }

      // 🔹 Normaliza para sempre devolver o mesmo shape
      const dataKey = Object.keys(raw).find((key) =>
        Array.isArray(raw[key]),
      ) as keyof typeof raw;

      return {
        data: (raw[dataKey] as T[]) ?? [],
        total: raw.total ?? 0,
        page: raw.page ?? page,
        limit: raw.limit ?? queryParams.limit ?? 10,
        totalPages:
          raw.totalPages ??
          (raw.total && raw.limit ? Math.ceil(raw.total / raw.limit) : 1),
      } satisfies PaginationResponse<T>;
    },
    enabled,
    gcTime: 300_000, // cache: 5min
    retry: 1,
    placeholderData: keepPreviousData ? (prev) => prev : undefined,
  });

  const goToNextPage = () => {
    if (query.data && page < query.data.totalPages) {
      setPage(page + 1);
    }
  };

  const goToPreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  return {
    data: query.data?.data ?? [],
    total: query.data?.total ?? 0,
    page,
    limit: query.data?.limit ?? queryParams.limit ?? 10,
    totalPages: query.data?.totalPages ?? 1,
    isLoading: query.isLoading,
    isError: query.isError,
    goToNextPage,
    goToPreviousPage,
    setPage,
    refetch: query.refetch,
  };
}
