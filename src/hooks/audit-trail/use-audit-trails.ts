"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { auditTrailService } from "@/services";
import { AuditTrailFilters, AuditTrailResponse } from "@/types";

export function useAuditFilters() {
  const router = useRouter();
  const query = useSearchParams();

  const filters: AuditTrailFilters = {
    entity: (query.get("entity") as any) || undefined,
    action: (query.get("action") as any) || undefined,
    userId: query.get("userId") || undefined,
    entityId: query.get("entityId") || undefined,
    search: query.get("search") || undefined,
    dateFrom: query.get("dateFrom") || undefined,
    dateTo: query.get("dateTo") || undefined,
  };

  const page = Number(query.get("page")) || 1;

  function setFilters(newFilters: Partial<AuditTrailFilters>) {
    const updated = { ...filters, ...newFilters };
    const searchParams = new URLSearchParams();

    if (updated.entity) searchParams.set("entity", updated.entity);
    if (updated.action) searchParams.set("action", updated.action);
    if (updated.userId) searchParams.set("userId", updated.userId);
    if (updated.entityId) searchParams.set("entityId", updated.entityId);
    if (updated.search) searchParams.set("search", updated.search);
    if (updated.dateFrom) searchParams.set("dateFrom", updated.dateFrom);
    if (updated.dateTo) searchParams.set("dateTo", updated.dateTo);

    searchParams.set("page", "1");
    router.push(`?${searchParams.toString()}`);
  }

  function clearAllFilters() {
    router.push("?", { scroll: false });
  }

  function setPage(pageNumber: number) {
    const searchParams = new URLSearchParams(query.toString());
    searchParams.set("page", String(pageNumber));
    router.push(`?${searchParams.toString()}`);
  }

  return { filters, setFilters, clearAllFilters, page, setPage };
}

export function useGetAuditTrailDetails(id?: string) {
  return useQuery<AuditTrailResponse | null>({
    queryKey: ["audit-trail-details", id],
    queryFn: async () => {
      if (!id) return null;
      const response = await auditTrailService.getAuditTrailById(id);
      return response.data;
    },
    enabled: !!id,
  });
}
