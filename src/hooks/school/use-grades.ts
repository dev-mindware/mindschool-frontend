"use client";

import { useMemo } from "react";
import { useGradeStore } from "@/stores/school/grade-store";
import { AssessmentTerm } from "@/types/grade";

export function useGrades(sectionId?: string, subjectId?: string, term?: AssessmentTerm) {
  const {
    gradeSheets,
    auditLogs,
    closedPautas,
    updateGradeEntry,
    lockMiniPauta,
    closeSectionPauta,
    reopenSectionPauta,
    getSectionGradeSheet,
    getConsolidatedPauta,
    getStudentReportCard,
  } = useGradeStore();

  const currentSheet = useMemo(() => {
    if (!sectionId || !subjectId || !term) return undefined;
    return getSectionGradeSheet(sectionId, subjectId, term);
  }, [sectionId, subjectId, term, getSectionGradeSheet, gradeSheets]);

  const auditHistory = useMemo(() => {
    if (!sectionId) return auditLogs;
    return auditLogs.filter((log) => log.sectionId === sectionId);
  }, [auditLogs, sectionId]);

  return {
    currentSheet,
    allSheets: gradeSheets,
    auditHistory,
    closedPautas,
    updateGradeEntry,
    lockMiniPauta,
    closeSectionPauta,
    reopenSectionPauta,
    getSectionGradeSheet,
    getConsolidatedPauta,
    getStudentReportCard,
  };
}
