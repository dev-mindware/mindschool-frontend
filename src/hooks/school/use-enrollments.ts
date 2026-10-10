"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { enrollmentsService } from "@/services/enrollments-service";
import { useActiveSchoolStore } from "@/stores/school/active-school-store";
import { EnrollmentStatus } from "@/types";

const ITEMS_PER_PAGE = 8;

/** Matriculas da escola activa (API). */
export function useEnrollments(searchQuery = "", statusFilter: EnrollmentStatus | "ALL" = "ALL", sectionFilter = "ALL") {
  const schoolId = useActiveSchoolStore((s) => s.schoolId);
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);

  const { data: all = [], isLoading, isError } = useQuery({
    queryKey: ["enrollments", schoolId],
    queryFn: () => enrollmentsService.list(),
    enabled: Boolean(schoolId),
    staleTime: 60 * 1000,
  });

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return all.filter(
      (e) =>
        (!q || e.studentName.toLowerCase().includes(q) || e.enrollmentNumber.toLowerCase().includes(q)) &&
        (statusFilter === "ALL" || e.status === statusFilter) &&
        (sectionFilter === "ALL" || e.sectionId === sectionFilter),
    );
  }, [all, searchQuery, statusFilter, sectionFilter]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));
  const page = Math.min(currentPage, totalPages);
  const paginated = useMemo(() => filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE), [filtered, page]);

  const counts = useMemo(
    () => ({
      total: all.length,
      active: all.filter((e) => e.status === "ACTIVE").length,
      pending: 0,
      transferred: all.filter((e) => e.status === "TRANSFERRED").length,
      cancelled: all.filter((e) => e.status === "CANCELLED").length,
    }),
    [all],
  );

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["enrollments", schoolId] });
    queryClient.invalidateQueries({ queryKey: ["students", schoolId] });
    queryClient.invalidateQueries({ queryKey: ["sections", schoolId] });
  };
  const enroll = useMutation({ mutationFn: (v: { studentId: string; sectionId: string }) => enrollmentsService.enroll(v.studentId, v.sectionId), onSuccess: invalidate });
  const cancel = useMutation({ mutationFn: (v: { id: string; reason: string; justified?: boolean }) => enrollmentsService.cancel(v.id, v.reason, v.justified), onSuccess: invalidate });

  return {
    enrollments: paginated,
    allEnrollments: filtered,
    isLoading,
    isError,
    total,
    totalPages,
    currentPage: page,
    setCurrentPage,
    goToNextPage: () => setCurrentPage((p) => Math.min(totalPages, p + 1)),
    goToPreviousPage: () => setCurrentPage((p) => Math.max(1, p - 1)),
    counts,
    enroll,
    cancel,
  };
}
