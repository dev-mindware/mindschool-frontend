"use client";
import { useTransition } from "react";
import { api } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams, useRouter } from "next/navigation";

export interface PaginationResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface UsePaginatedFetchOptions {
  endpoint: string;
  queryKey: string[] | string;
  queryParams?: Record<string, any>;
  enabled?: boolean;
  keepPreviousData?: boolean;
}

export function usePagination<T>({
  endpoint,
  queryKey,
  queryParams = {},
  enabled = true,
  keepPreviousData = true,
}: UsePaginatedFetchOptions) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const page = Number(searchParams.get("page")) || 1;

  const cleanQueryParams = Object.fromEntries(
    Object.entries(queryParams).filter(
      ([_, value]) => value !== null && value !== undefined && value !== "",
    ),
  );

  const query = useQuery<PaginationResponse<T>>({
    queryKey: Array.isArray(queryKey)
      ? [...queryKey, page, cleanQueryParams]
      : [queryKey, page, cleanQueryParams],
    queryFn: async () => {
      const response = await api.get(endpoint, {
        params: { page, ...cleanQueryParams },
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
      const dataKey = Object.keys(raw).find(
        (key) => Array.isArray(raw[key])
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

  const updatePageInUrl = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  };

  const goToNextPage = () => {
    if (query.data && page < query.data.totalPages) {
      updatePageInUrl(page + 1);
    }
  };

  const goToPreviousPage = () => {
    if (page > 1) {
      updatePageInUrl(page - 1);
    }
  };

  return {
    data: query.data?.data ?? [],
    total: query.data?.total ?? 0,
    page,
    limit: query.data?.limit ?? queryParams.limit ?? 10,
    totalPages: query.data?.totalPages ?? 1,
    isLoading: query.isLoading || isPending,
    isError: query.isError,
    goToNextPage,
    goToPreviousPage,
    setPage: updatePageInUrl,
    refetch: query.refetch,
  };
}
