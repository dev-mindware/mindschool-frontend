"use client";

import { useMemo, useState } from "react";
import { useTuitionStore } from "@/stores/school/tuition-store";
import { TuitionStatus } from "@/types/tuition";

export function useTuition(
  searchQuery = "",
  statusFilter: TuitionStatus | "ALL" = "ALL",
  monthFilter: number | "ALL" = "ALL"
) {
  const { plans, fees, summary, addPlan, updatePlan, deletePlan, registerFeePayment, recordCollectionNotice } =
    useTuitionStore();

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredFees = useMemo(() => {
    return fees.filter((fee) => {
      const matchesSearch =
        !searchQuery ||
        fee.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fee.studentNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (fee.receiptNumber && fee.receiptNumber.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus = statusFilter === "ALL" || fee.status === statusFilter;
      const matchesMonth = monthFilter === "ALL" || fee.month === monthFilter;

      return matchesSearch && matchesStatus && matchesMonth;
    });
  }, [fees, searchQuery, statusFilter, monthFilter]);

  const total = filteredFees.length;
  const totalPages = Math.max(1, Math.ceil(total / itemsPerPage));

  const paginatedFees = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredFees.slice(start, start + itemsPerPage);
  }, [filteredFees, currentPage, itemsPerPage]);

  const counts = useMemo(() => {
    return {
      total: fees.length,
      paid: fees.filter((f) => f.status === "PAID").length,
      pending: fees.filter((f) => f.status === "PENDING").length,
      overdue: fees.filter((f) => f.status === "OVERDUE").length,
      exempt: fees.filter((f) => f.status === "EXEMPT").length,
    };
  }, [fees]);

  return {
    plans,
    fees: paginatedFees,
    allFees: filteredFees,
    summary,
    total,
    totalPages,
    currentPage,
    setCurrentPage,
    goToNextPage: () => setCurrentPage((p) => Math.min(totalPages, p + 1)),
    goToPreviousPage: () => setCurrentPage((p) => Math.max(1, p - 1)),
    counts,
    addPlan,
    updatePlan,
    deletePlan,
    registerFeePayment,
    recordCollectionNotice,
  };
}
