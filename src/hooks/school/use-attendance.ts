"use client";

import { useMemo } from "react";
import { useStudentAttendanceStore } from "@/stores/school/student-attendance-store";
import { useTeacherAttendanceStore } from "@/stores/school/teacher-attendance-store";

export function useAttendance(classId?: string, date?: string) {
  const {
    records: studentRecords,
    justifications: studentJustifications,
    disciplinaryOccurrences,
    markAttendance,
    markAllPresent,
    submitJustification,
    reviewJustification,
  } = useStudentAttendanceStore();

  const {
    attendanceLogs: teacherLogs,
    credentials: teacherCredentials,
    registerScan,
    justifyAbsence: justifyTeacherAbsence,
    getMetrics: getTeacherMetrics,
  } = useTeacherAttendanceStore();

  const filteredStudentRecords = useMemo(() => {
    if (!classId && !date) return studentRecords;
    return studentRecords.filter((r) => {
      const matchClass = !classId || r.classId === classId;
      const matchDate = !date || r.date === date;
      return matchClass && matchDate;
    });
  }, [studentRecords, classId, date]);

  return {
    studentRecords: filteredStudentRecords,
    allStudentRecords: studentRecords,
    studentJustifications,
    disciplinaryOccurrences,
    markAttendance,
    markAllPresent,
    submitJustification,
    reviewJustification,
    teacherLogs,
    teacherCredentials,
    registerScan,
    justifyTeacherAbsence,
    getTeacherMetrics,
  };
}
