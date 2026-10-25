"use client";

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { archiveService, type ArchiveFilters } from "@/services/archive-service";
import { useActiveSchoolStore } from "@/stores/school/active-school-store";

/** Arquivo documental da escola ativa: resumo, pesquisa paginada por cursor, prorrogação da retenção e pacote ZIP. */
export function useArchive(filters: ArchiveFilters) {
  const schoolId = useActiveSchoolStore((s) => s.schoolId);
  const qc = useQueryClient();
  const on = Boolean(schoolId);

  const summary = useQuery({ queryKey: ["archive-summary", schoolId], queryFn: archiveService.summary, enabled: on, staleTime: 30 * 1000, retry: false });
  const items = useInfiniteQuery({
    queryKey: ["archive-items", schoolId, filters],
    queryFn: ({ pageParam }) => archiveService.items(filters, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.page.next_cursor ?? undefined,
    enabled: on,
    retry: false,
  });

  const refresh = () => {
    void qc.invalidateQueries({ queryKey: ["archive-summary", schoolId] });
    void qc.invalidateQueries({ queryKey: ["archive-items", schoolId] });
  };
  const extend = useMutation({ mutationFn: (v: { id: string; until: string; reason: string }) => archiveService.extendRetention(v.id, v.until, v.reason), onSuccess: refresh });
  const bundle = useMutation({ mutationFn: (ids: string[]) => archiveService.downloadBundle(ids) });

  return {
    summary: summary.data,
    summaryError: summary.error,
    items: items.data?.pages.flatMap((p) => p.data) ?? [],
    isLoading: items.isLoading || summary.isLoading,
    hasMore: Boolean(items.hasNextPage),
    loadMore: () => items.fetchNextPage(),
    loadingMore: items.isFetchingNextPage,
    extend,
    bundle,
  };
}
