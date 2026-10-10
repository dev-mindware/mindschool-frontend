"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { academicService } from "@/services/academic-service";
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

function useAcademicQuery<T>(key: string, fn: () => Promise<T>) {
  const schoolId = useActiveSchoolStore((s) => s.schoolId);
  return { schoolId, ...useQuery({ queryKey: [key, schoolId], queryFn: fn, enabled: Boolean(schoolId), staleTime: 60 * 1000 }) };
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
    mutationFn: (v: { id?: string; name: string; classLevelName: string; shift: Shift; capacity: number }) => academicService.saveSection(v.id, v),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["sections", schoolId] }),
  });
  return {
    sections: paging.paginated,
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
    mutationFn: (v: { id?: string; name: string; isCore: boolean }) => academicService.saveSubject(v.id, v),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["subjects", schoolId] }),
  });
  return {
    subjects: paging.paginated,
    allSubjects: subjects,
    isLoading,
    save,
    ...paging,
    counts: {
      total: subjects.length,
      primary: 0,
      lowerSecondary: subjects.length,
      upperSecondary: 0,
      totalWeeklyHours: subjects.reduce((a, s) => a + s.weeklyHours, 0),
    },
  };
}

export function useTeachers() {
  return useAcademicQuery("teachers", academicService.teachers);
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
