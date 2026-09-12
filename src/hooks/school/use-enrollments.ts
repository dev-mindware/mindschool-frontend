"use client";

import { useState, useMemo } from "react";
import { useSchoolDataStore } from "@/stores/school/school-data-store";
import { EnrollmentStatus } from "@/types";

export function useEnrollments(
  searchQuery = "",
  statusFilter: EnrollmentStatus | "ALL" = "ALL",
  sectionFilter = "ALL"
) {
  const { enrollments } = useSchoolDataStore();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const filteredEnrollments = useMemo(() => {
    return enrollments.filter((enrollment) => {
      const matchesSearch =
        !searchQuery ||
        enrollment.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        enrollment.studentNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        enrollment.enrollmentNumber.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === "ALL" || enrollment.status === statusFilter;

      const matchesSection =
        sectionFilter === "ALL" || enrollment.sectionId === sectionFilter;

      return matchesSearch && matchesStatus && matchesSection;
    });
  }, [enrollments, searchQuery, statusFilter, sectionFilter]);

  const total = filteredEnrollments.length;
  const totalPages = Math.max(1, Math.ceil(total / itemsPerPage));

  const paginatedEnrollments = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredEnrollments.slice(start, start + itemsPerPage);
  }, [filteredEnrollments, currentPage]);

  const counts = useMemo(() => {
    return {
      total: enrollments.length,
      active: enrollments.filter((e) => e.status === "ACTIVE").length,
      pending: 0, // Enrollment type has no PENDING - placeholder
      transferred: enrollments.filter((e) => e.status === "TRANSFERRED").length,
      cancelled: enrollments.filter((e) => e.status === "CANCELLED").length,
    };
  }, [enrollments]);

  return {
    enrollments: paginatedEnrollments,
    allEnrollments: filteredEnrollments,
    total,
    totalPages,
    currentPage,
    setCurrentPage,
    goToNextPage: () => setCurrentPage((p) => Math.min(totalPages, p + 1)),
    goToPreviousPage: () => setCurrentPage((p) => Math.max(1, p - 1)),
    counts,
  };
}
