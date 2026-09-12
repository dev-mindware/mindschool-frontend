"use client";

import { useState, useMemo } from "react";
import { useSchoolDataStore } from "@/stores/school/school-data-store";
import { Student, StudentStatus } from "@/types";

export function useStudents(searchQuery = "", statusFilter: StudentStatus | "ALL" = "ALL", classFilter = "ALL") {
  const { students, addStudent, updateStudent, deleteStudent } = useSchoolDataStore();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesSearch =
        !searchQuery ||
        student.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.studentNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.idDocumentNumber.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === "ALL" || student.status === statusFilter;

      const matchesClass =
        classFilter === "ALL" ||
        student.currentClassLevel === classFilter ||
        student.currentSectionId === classFilter;

      return matchesSearch && matchesStatus && matchesClass;
    });
  }, [students, searchQuery, statusFilter, classFilter]);

  const total = filteredStudents.length;
  const totalPages = Math.max(1, Math.ceil(total / itemsPerPage));

  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredStudents.slice(start, start + itemsPerPage);
  }, [filteredStudents, currentPage, itemsPerPage]);

  const counts = useMemo(() => {
    return {
      total: students.length,
      enrolled: students.filter((s) => s.status === "ENROLLED").length,
      pending: students.filter((s) => s.status === "PENDING").length,
      transferred: students.filter((s) => s.status === "TRANSFERRED").length,
      cancelled: students.filter((s) => s.status === "CANCELLED").length,
    };
  }, [students]);

  return {
    students: paginatedStudents,
    allStudents: filteredStudents,
    total,
    totalPages,
    currentPage,
    setCurrentPage,
    goToNextPage: () => setCurrentPage((p) => Math.min(totalPages, p + 1)),
    goToPreviousPage: () => setCurrentPage((p) => Math.max(1, p - 1)),
    counts,
    addStudent,
    updateStudent,
    deleteStudent,
  };
}
