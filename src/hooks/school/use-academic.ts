"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { academicService } from "@/services/academic-service";
import { sectionsService } from "@/services/sections-service";
import type { AcademicYearDraft } from "@/lib/academic-year";
import { useCan } from "@/hooks/auth/use-can";
import { useActiveSchoolStore } from "@/stores/school/active-school-store";
import { EducationCycle, Shift } from "@/types";

const ITEMS_PER_PAGE = 8;

function usePaging<T>(items: T[]) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(items.length / ITEMS_PER_PAGE));
  const page = Math.min(currentPage, totalPages);
  const paginated = useMemo(() => items.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE), [items, page]);
  return {
    paginated,
    total: items.length,
    totalPages,
    currentPage: page,
    setCurrentPage,
    goToNextPage: () => setCurrentPage((p) => Math.min(totalPages, p + 1)),
    goToPreviousPage: () => setCurrentPage((p) => Math.max(1, p - 1)),
  };
}

function useAcademicQuery<T>(key: string, fn: () => Promise<T>, allowed = true) {
  const schoolId = useActiveSchoolStore((s) => s.schoolId);
  return { schoolId, ...useQuery({ queryKey: [key, schoolId], queryFn: fn, enabled: Boolean(schoolId) && allowed, staleTime: 60 * 1000 }) };
}

export function useAcademicSections(searchQuery = "", shiftFilter: Shift | "ALL" = "ALL", cycleFilter: EducationCycle | "ALL" = "ALL") {
  const { data: sections = [], isLoading, schoolId } = useAcademicQuery("sections", academicService.sections);
  const queryClient = useQueryClient();
  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return sections.filter(
      (s) =>
        (!q || s.name.toLowerCase().includes(q) || s.classLevel.toLowerCase().includes(q)) &&
        (shiftFilter === "ALL" || s.shift === shiftFilter) &&
        (cycleFilter === "ALL" || s.cycle === cycleFilter),
    );
  }, [sections, searchQuery, shiftFilter, cycleFilter]);
  const paging = usePaging(filtered);
  const totalCap = sections.reduce((a, s) => a + s.capacity, 0);
  const totalEnr = sections.reduce((a, s) => a + s.currentEnrollmentCount, 0);
  const save = useMutation({
    mutationFn: (v: {
      id?: string;
      name: string;
      classLevelName: string;
      shift: Shift;
      capacity: number;
      academicYear?: string;
      roomNumber?: string;
      startTime?: string;
      endTime?: string;
    }) => academicService.saveSection(v.id, v),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["sections", schoolId] }),
  });
  const remove = useMutation({
    mutationFn: (id: string) => sectionsService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["sections", schoolId] }),
  });
  return {
    sections: paging.paginated,
    remove,
    allSections: sections,
    isLoading,
    save,
    ...paging,
    counts: {
      total: sections.length,
      morning: sections.filter((s) => s.shift === "MORNING").length,
      afternoon: sections.filter((s) => s.shift === "AFTERNOON").length,
      overallOccupancyRate: totalCap > 0 ? Math.round((totalEnr / totalCap) * 100) : 0,
    },
  };
}

export function useSubjects(searchQuery = "", cycleFilter: EducationCycle | "ALL" = "ALL") {
  const { data: subjects = [], isLoading, schoolId } = useAcademicQuery("subjects", academicService.subjects);
  const queryClient = useQueryClient();
  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return subjects.filter((s) => (!q || s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q)) && (cycleFilter === "ALL" || s.cycle === cycleFilter));
  }, [subjects, searchQuery, cycleFilter]);
  const paging = usePaging(filtered);
  const save = useMutation({
    mutationFn: (v: { id?: string; name: string; isCore: boolean; code?: string; gradingScale?: "quantitativa" | "qualitativa" | "mista" }) =>
      academicService.saveSubject(v.id, v),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["subjects", schoolId] }),
  });
  const remove = useMutation({
    mutationFn: (id: string) => academicService.deleteSubject(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["subjects", schoolId] }),
  });
  return {
    subjects: paging.paginated,
    allSubjects: subjects,
    isLoading,
    save,
    remove,
    ...paging,
    counts: {
      total: subjects.length,
      core: subjects.filter((s) => Boolean(s.isCore)).length,
      quantitative: subjects.filter((s) => !s.gradingScale || s.gradingScale === "quantitativa").length,
      active: subjects.filter((s) => s.isActive).length,
    },
  };
}

export function useTeachers() {
  const { can } = useCan();
  // O professor não lê a lista de colegas (teacher:read é da gestão): a sua ficha vem das atribuições.
  return useAcademicQuery("teachers", academicService.teachers, can("teacher:read"));
}

export function useTeacherAssignments(searchQuery = "", sectionFilter = "ALL") {
  const { data: assignments = [], isLoading, schoolId } = useAcademicQuery("assignments", academicService.assignments);
  const queryClient = useQueryClient();
  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return assignments.filter(
      (a) =>
        (!q || a.teacherName.toLowerCase().includes(q) || a.subjectName.toLowerCase().includes(q) || a.sectionName.toLowerCase().includes(q)) &&
        (sectionFilter === "ALL" || a.sectionId === sectionFilter),
    );
  }, [assignments, searchQuery, sectionFilter]);
  const paging = usePaging(filtered);
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["assignments", schoolId] });
  const assign = useMutation({ mutationFn: academicService.assign, onSuccess: invalidate });
  const unassign = useMutation({ mutationFn: (v: { sectionId: string; id: string }) => academicService.unassign(v.sectionId, v.id), onSuccess: invalidate });
  return {
    assignments: paging.paginated,
    allAssignments: assignments,
    isLoading,
    assign,
    unassign,
    ...paging,
    counts: {
      totalAssignments: assignments.length,
      uniqueTeachers: new Set(assignments.map((a) => a.teacherId)).size,
      uniqueSections: new Set(assignments.map((a) => a.sectionId)).size,
      totalAllocatedHours: assignments.reduce((a, x) => a + x.weeklyHours, 0),
    },
  };
}

/** Resumo combinado (mantido por compatibilidade). */
export function useAcademic() {
  const { data: sections = [] } = useAcademicQuery("sections", academicService.sections);
  const { data: subjects = [] } = useAcademicQuery("subjects", academicService.subjects);
  const { data: assignments = [] } = useAcademicQuery("assignments", academicService.assignments);
  const totalCap = sections.reduce((a, s) => a + s.capacity, 0);
  const totalEnr = sections.reduce((a, s) => a + s.currentEnrollmentCount, 0);
  return {
    sections,
    subjects,
    assignments,
    metrics: {
      totalSections: sections.length,
      totalSubjects: subjects.length,
      totalAssignments: assignments.length,
      totalCapacity: totalCap,
      totalEnrolled: totalEnr,
      occupancyRate: totalCap > 0 ? Math.round((totalEnr / totalCap) * 100) : 0,
      remainingSeats: Math.max(0, totalCap - totalEnr),
    },
  };
}

export function useAcademicYears() {
  const { data: years = [], isLoading, isError, refetch, schoolId } = useAcademicQuery("academic-years", academicService.years);
  const queryClient = useQueryClient();
  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ["academic-years", schoolId] });
    queryClient.invalidateQueries({ queryKey: ["active-year", schoolId] });
    queryClient.invalidateQueries({ queryKey: ["academic-terms", schoolId] });
    queryClient.invalidateQueries({ queryKey: ["calendar-events", schoolId] });
    queryClient.invalidateQueries({ queryKey: ["school-days", schoolId] });
  };
  const currentYear = useMemo(
    () => years.find((y) => y.status === "activo") ?? years.find((y) => y.status === "suspenso") ?? years[0],
    [years],
  );
  const createYear = useMutation({
    mutationFn: (v: AcademicYearDraft) => academicService.createYear(v),
    onSuccess: invalidateAll,
  });
  const updateYear = useMutation({
    mutationFn: (v: { id: string; data: Parameters<typeof academicService.updateYear>[1] }) => academicService.updateYear(v.id, v.data),
    onSuccess: invalidateAll,
  });
  const activateYear = useMutation({
    mutationFn: (id: string) => academicService.activateYear(id),
    onSuccess: invalidateAll,
  });
  const changeRegime = useMutation({
    mutationFn: (v: { id: string; regime: "presencial" | "hibrido" | "remoto"; reason: string }) => academicService.changeRegime(v.id, { regime: v.regime, reason: v.reason }),
    onSuccess: invalidateAll,
  });
  const suspendYear = useMutation({
    mutationFn: (v: { id: string; reason: string; create_calendar_event?: boolean; event_end_date?: string }) =>
      academicService.suspendYear(v.id, { reason: v.reason, create_calendar_event: v.create_calendar_event, event_end_date: v.event_end_date }),
    onSuccess: invalidateAll,
  });
  const resumeYear = useMutation({
    mutationFn: (v: { id: string; regime: "presencial" | "hibrido" | "remoto"; reason: string; new_end_date?: string }) =>
      academicService.resumeYear(v.id, { regime: v.regime, reason: v.reason, new_end_date: v.new_end_date }),
    onSuccess: invalidateAll,
  });
  const closeYear = useMutation({
    mutationFn: (v: { id: string; reason?: string }) => academicService.closeYear(v.id, v.reason),
    onSuccess: invalidateAll,
  });
  const reopenYear = useMutation({
    mutationFn: (v: { id: string; regime: "presencial" | "hibrido" | "remoto"; reason: string }) =>
      academicService.reopenYear(v.id, { regime: v.regime, reason: v.reason }),
    onSuccess: invalidateAll,
  });
  return {
    years,
    currentYear,
    isLoading,
    isError,
    refetch,
    createYear,
    updateYear,
    activateYear,
    changeRegime,
    suspendYear,
    resumeYear,
    closeYear,
    reopenYear,
  };
}

export function useYearTerms(yearId?: string) {
  const schoolId = useActiveSchoolStore((s) => s.schoolId);
  const queryClient = useQueryClient();
  const termsQuery = useQuery({
    queryKey: ["academic-terms", schoolId, yearId],
    queryFn: () => academicService.terms(yearId!),
    enabled: Boolean(schoolId && yearId),
    staleTime: 30 * 1000,
  });
  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["academic-terms", schoolId, yearId] });
    queryClient.invalidateQueries({ queryKey: ["school-days", schoolId] });
    queryClient.invalidateQueries({ queryKey: ["calendar-events", schoolId] });
  };
  const createDefaults = useMutation({
    mutationFn: () => academicService.createDefaultTerms(yearId!),
    onSuccess: refresh,
  });
  const createTerm = useMutation({
    mutationFn: (v: Parameters<typeof academicService.createTerm>[1]) => academicService.createTerm(yearId!, v),
    onSuccess: refresh,
  });
  const updateTerm = useMutation({
    mutationFn: (v: { termId: string; data: Parameters<typeof academicService.updateTerm>[2] }) => academicService.updateTerm(yearId!, v.termId, v.data),
    onSuccess: refresh,
  });
  return {
    terms: termsQuery.data ?? [],
    isLoading: termsQuery.isLoading,
    isError: termsQuery.isError,
    createDefaults,
    createTerm,
    updateTerm,
  };
}

