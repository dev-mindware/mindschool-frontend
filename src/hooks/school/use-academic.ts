"use client";

import { useState, useMemo } from "react";
import { useSchoolDataStore } from "@/stores/school/school-data-store";
import { Shift, EducationCycle } from "@/types";

export function useAcademicSections(
  searchQuery = "",
  shiftFilter: Shift | "ALL" = "ALL",
  cycleFilter: EducationCycle | "ALL" = "ALL"
) {
  const { sections } = useSchoolDataStore();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const filtered = useMemo(() => {
    return sections.filter((sec) => {
      const matchesSearch =
        !searchQuery ||
        sec.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sec.classLevel.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sec.roomNumber.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesShift = shiftFilter === "ALL" || sec.shift === shiftFilter;
      const matchesCycle = cycleFilter === "ALL" || sec.cycle === cycleFilter;

      return matchesSearch && matchesShift && matchesCycle;
    });
  }, [sections, searchQuery, shiftFilter, cycleFilter]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / itemsPerPage));
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage]);

  const counts = useMemo(() => {
    const totalCap = sections.reduce((a, s) => a + s.capacity, 0);
    const totalEnr = sections.reduce((a, s) => a + s.currentEnrollmentCount, 0);
    return {
      total: sections.length,
      morning: sections.filter((s) => s.shift === "MORNING").length,
      afternoon: sections.filter((s) => s.shift === "AFTERNOON").length,
      overallOccupancyRate: totalCap > 0 ? Math.round((totalEnr / totalCap) * 100) : 0,
    };
  }, [sections]);

  return {
    sections: paginated,
    total,
    totalPages,
    currentPage,
    setCurrentPage,
    goToNextPage: () => setCurrentPage((p) => Math.min(totalPages, p + 1)),
    goToPreviousPage: () => setCurrentPage((p) => Math.max(1, p - 1)),
    counts,
  };
}

export function useSubjects(
  searchQuery = "",
  cycleFilter: EducationCycle | "ALL" = "ALL"
) {
  const { subjects } = useSchoolDataStore();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const filtered = useMemo(() => {
    return subjects.filter((sub) => {
      const matchesSearch =
        !searchQuery ||
        sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.code.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCycle = cycleFilter === "ALL" || sub.cycle === cycleFilter;
      return matchesSearch && matchesCycle;
    });
  }, [subjects, searchQuery, cycleFilter]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / itemsPerPage));
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage]);

  const counts = useMemo(() => {
    return {
      total: subjects.length,
      primary: subjects.filter((s) => s.cycle === "PRIMARY").length,
      lowerSecondary: subjects.filter((s) => s.cycle === "LOWER_SECONDARY").length,
      upperSecondary: subjects.filter((s) => s.cycle === "UPPER_SECONDARY").length,
      totalWeeklyHours: subjects.reduce((a, s) => a + s.weeklyHours, 0),
    };
  }, [subjects]);

  return {
    subjects: paginated,
    total,
    totalPages,
    currentPage,
    setCurrentPage,
    goToNextPage: () => setCurrentPage((p) => Math.min(totalPages, p + 1)),
    goToPreviousPage: () => setCurrentPage((p) => Math.max(1, p - 1)),
    counts,
  };
}

export function useTeacherAssignments(
  searchQuery = "",
  sectionFilter = "ALL"
) {
  const { assignments } = useSchoolDataStore();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const filtered = useMemo(() => {
    return assignments.filter((asg) => {
      const matchesSearch =
        !searchQuery ||
        asg.teacherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asg.subjectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asg.sectionName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSection =
        sectionFilter === "ALL" || asg.sectionId === sectionFilter;

      return matchesSearch && matchesSection;
    });
  }, [assignments, searchQuery, sectionFilter]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / itemsPerPage));
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage]);

  const counts = useMemo(() => {
    const uniqueTeachers = new Set(assignments.map((a) => a.teacherId)).size;
    const uniqueSections = new Set(assignments.map((a) => a.sectionId)).size;
    return {
      totalAssignments: assignments.length,
      uniqueTeachers,
      uniqueSections,
      totalAllocatedHours: assignments.reduce((a, asg) => a + asg.weeklyHours, 0),
    };
  }, [assignments]);

  return {
    assignments: paginated,
    total,
    totalPages,
    currentPage,
    setCurrentPage,
    goToNextPage: () => setCurrentPage((p) => Math.min(totalPages, p + 1)),
    goToPreviousPage: () => setCurrentPage((p) => Math.max(1, p - 1)),
    counts,
  };
}

// Legacy combined hook for backward compat
export function useAcademic() {
  const { sections, subjects, assignments } = useSchoolDataStore();
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
