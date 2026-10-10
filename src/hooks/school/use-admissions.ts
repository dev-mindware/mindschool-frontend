"use client";

import { useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { admissionsService } from "@/services/admissions-service";
import { useActiveSchoolStore } from "@/stores/school/active-school-store";
import type { AdmissionApplication, Candidate } from "@/types/admission";

/**
 * Admissoes da escola activa (API). Mantem a forma do antigo `useAdmissionStore` (listas + accoes assincronas)
 * para que os componentes mudem so a origem dos dados.
 */
export function useAdmissions() {
  const schoolId = useActiveSchoolStore((s) => s.schoolId);
  const queryClient = useQueryClient();
  const enabled = Boolean(schoolId);

  const apps = useQuery({ queryKey: ["admissions", schoolId], queryFn: admissionsService.applications, enabled, staleTime: 30 * 1000 });
  const exams = useQuery({ queryKey: ["admission-sessions", schoolId], queryFn: admissionsService.sessions, enabled, staleTime: 30 * 1000 });

  const raw = apps.data ?? [];
  const applications = useMemo(() => admissionsService.mapApplications(raw), [raw]);
  const candidates = useMemo(() => admissionsService.mapCandidates(raw), [raw]);

  const refresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["admissions", schoolId] }),
      queryClient.invalidateQueries({ queryKey: ["admission-sessions", schoolId] }),
      queryClient.invalidateQueries({ queryKey: ["students", schoolId] }),
      queryClient.invalidateQueries({ queryKey: ["enrollments", schoolId] }),
    ]);
  };

  return {
    applications,
    candidates,
    entranceExams: exams.data ?? [],
    isLoading: apps.isLoading,

    submitApplication: async (
      c: Omit<Candidate, "id" | "schoolId" | "createdAt" | "convertedStudentId">,
      a: { desiredClassLevelId: string; desiredClassLevelName: string; desiredShift?: string; requiresEntranceExam?: boolean; entranceExamId?: string; entranceExamTitle?: string },
    ) => {
      await admissionsService.submit({
        fullName: c.fullName,
        birthDate: c.birthDate,
        idDocumentType: c.idDocumentType,
        idDocumentNumber: c.idDocumentNumber,
        guardianName: c.guardianName,
        guardianPhone: c.guardianPhone,
        previousSchoolName: c.previousSchoolName,
        desiredClassLevelName: a.desiredClassLevelName,
      });
      await refresh();
    },
    validateDocuments: async (id: string) => {
      await admissionsService.validateDocuments(id);
      await refresh();
    },
    gradeCandidateExam: async (id: string, score: number, _feedback?: string) => {
      await admissionsService.gradeExam(id, score);
      await refresh();
    },
    decideApplication: async (id: string, decision: "APPROVED" | "WAITLIST" | "REJECTED", notes: string, _decidedBy?: string) => {
      await admissionsService.decide(id, decision === "APPROVED" ? "aprovada" : decision === "WAITLIST" ? "lista_espera" : "reprovada", notes);
      await refresh();
    },
    promoteFromWaitlist: async (id: string) => {
      const app: AdmissionApplication | undefined = applications.find((x) => x.id === id);
      if (app) await admissionsService.promoteWaitlist(app.academicYearId, app.desiredClassLevelId);
      await refresh();
    },
    convertCandidateToEnrollment: async (id: string, sectionId: string, _academicYear?: string) => {
      const r = await admissionsService.convert(id, sectionId);
      await refresh();
      return r;
    },
  };
}
