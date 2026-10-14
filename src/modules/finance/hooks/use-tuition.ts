"use client";
import { financeKeys } from "@/modules/finance/query-keys";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { tuitionService } from "@/modules/finance/services/tuition-service";
import { useActiveSchoolStore } from "@/stores/school/active-school-store";
import { TuitionPlan, TuitionStatus } from "@/modules/finance/types";

const ITEMS_PER_PAGE = 10;

/** Propinas (facturas) da escola activa + tabela de precos (`settings.finance`). */
export function useTuition(searchQuery = "", statusFilter: TuitionStatus | "ALL" = "ALL", monthFilter: number | "ALL" = "ALL") {
  const schoolId = useActiveSchoolStore((s) => s.schoolId);
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);

  const { data: fees = [], isLoading } = useQuery({
    queryKey: financeKeys.fees(schoolId),
    queryFn: () => tuitionService.fees(),
    enabled: Boolean(schoolId),
    staleTime: 30 * 1000,
  });
  const { data: plans = [] } = useQuery({ queryKey: financeKeys.plans(schoolId), queryFn: () => tuitionService.plans(), enabled: Boolean(schoolId), staleTime: 60 * 1000 });

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return fees.filter(
      (f) =>
        (!q || f.studentName.toLowerCase().includes(q) || f.studentNumber.toLowerCase().includes(q) || (f.receiptNumber ?? "").toLowerCase().includes(q)) &&
        (statusFilter === "ALL" || f.status === statusFilter) &&
        (monthFilter === "ALL" || f.month === monthFilter),
    );
  }, [fees, searchQuery, statusFilter, monthFilter]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));
  const page = Math.min(currentPage, totalPages);
  const paginated = useMemo(() => filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE), [filtered, page]);

  const counts = useMemo(
    () => ({
      total: fees.length,
      paid: fees.filter((f) => f.status === "PAID").length,
      pending: fees.filter((f) => f.status === "PENDING").length,
      overdue: fees.filter((f) => f.status === "OVERDUE").length,
      exempt: fees.filter((f) => f.status === "EXEMPT").length,
    }),
    [fees],
  );
  const summary = useMemo(() => tuitionService.summary(fees), [fees]);

  const savePlanMutation = useMutation({
    mutationFn: (p: Parameters<typeof tuitionService.savePlan>[0]) => tuitionService.savePlan(p),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: financeKeys.plans(schoolId) }),
  });

  return {
    plans,
    fees: paginated,
    allFees: filtered,
    isLoading,
    summary,
    total,
    totalPages,
    currentPage: page,
    setCurrentPage,
    goToNextPage: () => setCurrentPage((p) => Math.min(totalPages, p + 1)),
    goToPreviousPage: () => setCurrentPage((p) => Math.max(1, p - 1)),
    counts,
    // A escola tem UMA politica financeira: criar e editar gravam a mesma configuracao.
    addPlan: (p: Partial<TuitionPlan>) => savePlanMutation.mutate({ monthlyAmount: p.monthlyAmount ?? 0, registrationFee: p.registrationFee ?? 0, latePenaltyPercent: p.latePenaltyPercent ?? 0, penaltyGracePeriodDays: p.penaltyGracePeriodDays ?? 5 }),
    updatePlan: (_id: string, p: Partial<TuitionPlan>) =>
      savePlanMutation.mutate({
        monthlyAmount: p.monthlyAmount ?? plans[0]?.monthlyAmount ?? 0,
        registrationFee: p.registrationFee ?? plans[0]?.registrationFee ?? 0,
        latePenaltyPercent: p.latePenaltyPercent ?? plans[0]?.latePenaltyPercent ?? 0,
        penaltyGracePeriodDays: p.penaltyGracePeriodDays ?? plans[0]?.penaltyGracePeriodDays ?? 5,
      }),
    deletePlan: () => undefined,
    savePolicy: savePlanMutation,
  };
}
