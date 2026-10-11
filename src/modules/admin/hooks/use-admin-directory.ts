"use client";

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminDirectoryService, type OnboardSchoolInput, type UserAction } from "@/modules/admin/services/admin-directory-service";

const adminKeys = {
  schools: () => ["admin-schools"] as const,
  users: (q: string, status: string, schoolId: string) => ["admin-users", q, status, schoolId] as const,
};

/** Directório de escolas da plataforma (todas as escolas; pesquisa e filtros no cliente). */
export function useAdminSchools() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: adminKeys.schools(), queryFn: adminDirectoryService.schools, staleTime: 30_000, retry: false });
  const onboard = useMutation({
    mutationFn: (v: OnboardSchoolInput) => adminDirectoryService.onboard(v),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: adminKeys.schools() }); void qc.invalidateQueries({ queryKey: ["platform-overview"] }); },
  });
  return { schools: q.data ?? [], isLoading: q.isLoading, isError: q.isError, refetch: q.refetch, onboard };
}

/** Directório de utilizadores: pesquisa no servidor (mínimo 2 caracteres) e «carregar mais» por cursor. */
export function useAdminUsers(search: string, status: string, schoolId = "") {
  const qc = useQueryClient();
  const term = search.trim();
  const q = useInfiniteQuery({
    queryKey: adminKeys.users(term, status, schoolId),
    queryFn: ({ pageParam }) => adminDirectoryService.users({ ...(term.length >= 2 ? { q: term } : {}), ...(status ? { status } : {}), ...(schoolId ? { schoolId } : {}), ...(pageParam ? { cursor: pageParam } : {}) }),
    initialPageParam: "" as string,
    getNextPageParam: (last) => (last.page.has_more ? last.page.next_cursor ?? undefined : undefined),
    staleTime: 15_000,
    retry: false,
  });
  const act = useMutation({
    mutationFn: (v: { id: string; action: UserAction; reason: string; ticket?: string }) => adminDirectoryService.userAction(v.id, v.action, v.reason, v.ticket),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-users"] }),
  });
  return {
    users: q.data?.pages.flatMap((p) => p.data) ?? [],
    isLoading: q.isLoading, isError: q.isError, hasMore: Boolean(q.hasNextPage), loadMore: () => void q.fetchNextPage(), isLoadingMore: q.isFetchingNextPage,
    act,
  };
}
