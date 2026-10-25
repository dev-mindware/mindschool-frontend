"use client";

import { useMemo, useState } from "react";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CreateStudentInput, studentsService } from "@/services/students-service";
import { useActiveSchoolStore } from "@/stores/school/active-school-store";
import { Student, StudentStatus } from "@/types";

const ITEMS_PER_PAGE = 8;

/**
 * Alunos da escola ativa (API MindEscola). Lista lida por completo (cursor) e filtrada/paginada no cliente; a pesquisa
 * por texto (>= 2 caracteres) tambem vai ao servidor.
 */
export function useStudents(searchQuery = "", statusFilter: StudentStatus | "ALL" = "ALL", classFilter = "ALL") {
  const schoolId = useActiveSchoolStore((s) => s.schoolId);
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);

  const { data: all = [], isLoading, isError, error } = useQuery({
    queryKey: ["students", schoolId],
    queryFn: () => studentsService.list(),
    enabled: Boolean(schoolId),
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
  });

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return all.filter((s) => {
      const matchesSearch = !q || s.fullName.toLowerCase().includes(q) || s.idDocumentNumber.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "ALL" || s.status === statusFilter;
      const matchesClass = classFilter === "ALL" || s.currentClassLevel === classFilter || s.currentSectionId === classFilter;
      return matchesSearch && matchesStatus && matchesClass;
    });
  }, [all, searchQuery, statusFilter, classFilter]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));
  const page = Math.min(currentPage, totalPages);
  const paginated = useMemo(() => filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE), [filtered, page]);

  const counts = useMemo(
    () => ({
      total: all.length,
      enrolled: all.filter((s) => s.status === "ENROLLED").length,
      pending: all.filter((s) => s.status === "PENDING").length,
      transferred: all.filter((s) => s.status === "TRANSFERRED").length,
      cancelled: all.filter((s) => s.status === "CANCELLED").length,
    }),
    [all],
  );

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["students", schoolId] });
    queryClient.invalidateQueries({ queryKey: ["guardians", schoolId] });
    // matricular um aluno novo (Novo Ingresso) cria também a matrícula e as propinas: as listas têm de as mostrar já
    queryClient.invalidateQueries({ queryKey: ["enrollments", schoolId] });
    queryClient.invalidateQueries({ queryKey: ["invoices"] });
  };
  const createStudent = useMutation({ mutationFn: (input: CreateStudentInput) => studentsService.create(input), onSuccess: invalidate });
  const updateStudent = useMutation({
    mutationFn: ({ id, input }: { id: string; input: Parameters<typeof studentsService.update>[1] }) => studentsService.update(id, input),
    onSuccess: invalidate,
  });
  const inviteStudent = useMutation({
    mutationFn: ({ id, email }: { id: string; email?: string }) => studentsService.invite(id, email),
    onSuccess: invalidate,
  });

  return {
    students: paginated as Student[],
    allStudents: filtered,
    isLoading,
    isError,
    error,
    total,
    totalPages,
    currentPage: page,
    setCurrentPage,
    goToNextPage: () => setCurrentPage((p) => Math.min(totalPages, p + 1)),
    goToPreviousPage: () => setCurrentPage((p) => Math.max(1, p - 1)),
    counts,
    createStudent,
    updateStudent,
    inviteStudent,
  };
}
