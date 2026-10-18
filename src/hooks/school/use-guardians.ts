"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { guardiansService, GuardianInput } from "@/services/guardians-service";
import { useActiveSchoolStore } from "@/stores/school/active-school-store";
import { PreferredContactChannel } from "@/types";

const ITEMS_PER_PAGE = 8;

/** Encarregados da escola activa (API). Pesquisa e paginacao no cliente. */
export function useGuardians(searchQuery = "", channelFilter: PreferredContactChannel | "ALL" = "ALL") {
  const schoolId = useActiveSchoolStore((s) => s.schoolId);
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);

  const { data: guardians = [], isLoading, isError } = useQuery({
    queryKey: ["guardians", schoolId],
    queryFn: () => guardiansService.list(),
    enabled: Boolean(schoolId),
    staleTime: 60 * 1000,
  });

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return guardians.filter((g) => {
      const matchesSearch =
        !q ||
        g.fullName.toLowerCase().includes(q) ||
        g.phonePrimary.toLowerCase().includes(q) ||
        (g.email ?? "").toLowerCase().includes(q) ||
        (g.idDocumentNumber ?? "").toLowerCase().includes(q);
      return matchesSearch && (channelFilter === "ALL" || g.preferredContactChannel === channelFilter);
    });
  }, [guardians, searchQuery, channelFilter]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));
  const page = Math.min(currentPage, totalPages);
  const paginated = useMemo(() => filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE), [filtered, page]);

  const counts = useMemo(
    () => ({
      total: guardians.length,
      whatsapp: guardians.filter((g) => g.preferredContactChannel === "WHATSAPP").length,
      sms: guardians.filter((g) => g.preferredContactChannel === "SMS").length,
      email: guardians.filter((g) => g.preferredContactChannel === "EMAIL").length,
    }),
    [guardians],
  );

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["guardians", schoolId] });
    queryClient.invalidateQueries({ queryKey: ["students", schoolId] });
  };
  const createGuardian = useMutation({ mutationFn: (input: GuardianInput) => guardiansService.create(input), onSuccess: invalidate });
  const updateGuardian = useMutation({
    mutationFn: ({ id, input, previousWardIds }: { id: string; input: GuardianInput; previousWardIds: string[] }) => guardiansService.update(id, input, previousWardIds),
    onSuccess: invalidate,
  });
  const inviteGuardian = useMutation({
    mutationFn: ({ id, email }: { id: string; email?: string }) => guardiansService.invite(id, email),
    onSuccess: invalidate,
  });

  return {
    guardians: paginated,
    allGuardians: filtered,
    isLoading,
    isError,
    total,
    totalPages,
    currentPage: page,
    setCurrentPage,
    goToNextPage: () => setCurrentPage((p) => Math.min(totalPages, p + 1)),
    goToPreviousPage: () => setCurrentPage((p) => Math.max(1, p - 1)),
    counts,
    createGuardian,
    updateGuardian,
    inviteGuardian,
  };
}
