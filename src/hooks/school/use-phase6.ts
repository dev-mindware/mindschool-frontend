"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { academicService } from "@/services/academic-service";
import { sectionsService } from "@/services/sections-service";
import { gradesService } from "@/services/grades-service";
import { admissionsService } from "@/services/admissions-service";
import { phase6Service, type ApiCouncilAttendee, type ExamCall, type ExamResultInput, type Outcome, type ReviewStatus } from "@/services/phase6-service";
import { useActiveSchoolStore } from "@/stores/school/active-school-store";

const forbidden = (e: unknown) => (e as { response?: { status?: number } } | null)?.response?.status === 403;
const base = { staleTime: 20 * 1000, retry: (n: number, e: unknown) => !forbidden(e) && n < 2 };

export function useGradeReviews(status?: ReviewStatus) {
  const schoolId = useActiveSchoolStore((s) => s.schoolId);
  const qc = useQueryClient();
  const key = ["grade-reviews", schoolId, status];
  const q = useQuery({ queryKey: key, queryFn: () => phase6Service.reviews(status), enabled: Boolean(schoolId), ...base });
  const refresh = () => qc.invalidateQueries({ queryKey: ["grade-reviews", schoolId] });
  const start = useMutation({ mutationFn: (v: { id: string; note?: string }) => phase6Service.startReview(v.id, v.note), onSuccess: refresh });
  const decide = useMutation({ mutationFn: (v: { id: string; decision: "deferido" | "indeferido"; note: string; numericValue?: number }) => phase6Service.decideReview(v.id, v), onSuccess: refresh });
  return { reviews: q.data ?? [], isLoading: q.isLoading, forbidden: forbidden(q.error), start, decide };
}

export function useCouncils() {
  const schoolId = useActiveSchoolStore((s) => s.schoolId);
  const qc = useQueryClient();
  const list = useQuery({ queryKey: ["councils", schoolId], queryFn: phase6Service.councils, enabled: Boolean(schoolId), ...base });
  const { data: sections = [] } = useQuery({ queryKey: ["sections", schoolId], queryFn: () => sectionsService.list(), enabled: Boolean(schoolId), staleTime: 60 * 1000 });
  const { data: terms = [] } = useQuery({ queryKey: ["terms", schoolId], queryFn: () => gradesService.terms(), enabled: Boolean(schoolId), staleTime: 5 * 60 * 1000 });
  const create = useMutation({
    mutationFn: (v: { sectionId: string; kind: "periodico" | "final"; termId?: string; scheduledAt: string; agenda?: string }) => phase6Service.createCouncil(v.sectionId, v),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["councils", schoolId] }),
  });
  return { councils: list.data ?? [], isLoading: list.isLoading, forbidden: forbidden(list.error), sections, terms, create };
}

export function useCouncil(id: string | undefined) {
  const schoolId = useActiveSchoolStore((s) => s.schoolId);
  const qc = useQueryClient();
  const key = ["council", schoolId, id];
  const q = useQuery({ queryKey: key, queryFn: () => phase6Service.council(id!), enabled: Boolean(schoolId && id), ...base });
  const { data: members = [] } = useQuery({ queryKey: ["members", schoolId], queryFn: phase6Service.members, enabled: Boolean(schoolId && id), staleTime: 60 * 1000 });
  const refresh = () => {
    qc.invalidateQueries({ queryKey: key });
    qc.invalidateQueries({ queryKey: ["councils", schoolId] });
  };
  const setAttendees = useMutation({ mutationFn: (a: ApiCouncilAttendee[]) => phase6Service.setAttendees(id!, a), onSuccess: refresh });
  const putDecisions = useMutation({
    mutationFn: (d: Array<{ enrollment_id: string; outcome?: Outcome; justification?: string; observation?: string }>) => phase6Service.putDecisions(id!, d),
    onSuccess: refresh,
  });
  const close = useMutation({ mutationFn: (minutes: string) => phase6Service.closeCouncil(id!, minutes), onSuccess: refresh });
  return { council: q.data, isLoading: q.isLoading, members, setAttendees, putDecisions, close };
}

export function useFinalExams() {
  const schoolId = useActiveSchoolStore((s) => s.schoolId);
  const qc = useQueryClient();
  const list = useQuery({ queryKey: ["final-exams", schoolId], queryFn: phase6Service.finalExams, enabled: Boolean(schoolId), ...base });
  const { data: assignments = [] } = useQuery({ queryKey: ["assignments", schoolId], queryFn: academicService.assignments, enabled: Boolean(schoolId), staleTime: 60 * 1000 });
  const create = useMutation({
    mutationFn: (v: { sectionId: string; assignmentId: string; call: ExamCall; national: boolean; scheduledDate: string }) => phase6Service.createFinalExam(v.sectionId, v.assignmentId, v),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["final-exams", schoolId] }),
  });
  return { exams: list.data ?? [], isLoading: list.isLoading, forbidden: forbidden(list.error), assignments, create };
}

export function useFinalExam(id: string | undefined) {
  const schoolId = useActiveSchoolStore((s) => s.schoolId);
  const qc = useQueryClient();
  const key = ["final-exam", schoolId, id];
  const q = useQuery({ queryKey: key, queryFn: () => phase6Service.finalExam(id!), enabled: Boolean(schoolId && id), ...base });
  const refresh = () => {
    qc.invalidateQueries({ queryKey: key });
    qc.invalidateQueries({ queryKey: ["final-exams", schoolId] });
  };
  const enroll = useMutation({ mutationFn: (ids?: string[]) => phase6Service.enrollFinalExam(id!, ids), onSuccess: refresh });
  const putResults = useMutation({ mutationFn: (r: ExamResultInput[]) => phase6Service.putFinalResults(id!, r), onSuccess: refresh });
  const close = useMutation({ mutationFn: () => phase6Service.closeFinalExam(id!), onSuccess: refresh });
  return { exam: q.data, isLoading: q.isLoading, enroll, putResults, close };
}

export function useAdmissionSessions() {
  const schoolId = useActiveSchoolStore((s) => s.schoolId);
  const qc = useQueryClient();
  const list = useQuery({ queryKey: ["admission-sessions", schoolId], queryFn: phase6Service.sessions, enabled: Boolean(schoolId), ...base });
  const { data: year } = useQuery({ queryKey: ["active-year", schoolId], queryFn: academicService.activeYear, enabled: Boolean(schoolId), staleTime: 5 * 60 * 1000 });
  const { data: levels = [] } = useQuery({ queryKey: ["class-levels", schoolId], queryFn: academicService.classLevels, enabled: Boolean(schoolId), staleTime: 5 * 60 * 1000 });
  const { data: applications = [] } = useQuery({ queryKey: ["admission-applications", schoolId], queryFn: admissionsService.applications, enabled: Boolean(schoolId), staleTime: 30 * 1000 });
  const refresh = () => qc.invalidateQueries({ queryKey: ["admission-sessions", schoolId] });
  const create = useMutation({ mutationFn: (v: { classLevelId?: string; title: string; scheduledAt: string; location?: string; capacity: number }) => phase6Service.createSession({ ...v, academicYearId: year!.id }), onSuccess: refresh });
  const cancel = useMutation({ mutationFn: phase6Service.cancelSession, onSuccess: refresh });
  return { sessions: list.data ?? [], isLoading: list.isLoading, forbidden: forbidden(list.error), hasYear: Boolean(year), levels, applications, create, cancel };
}

export function useAdmissionSession(id: string | undefined) {
  const schoolId = useActiveSchoolStore((s) => s.schoolId);
  const qc = useQueryClient();
  const key = ["admission-session", schoolId, id];
  const q = useQuery({ queryKey: key, queryFn: () => phase6Service.session(id!), enabled: Boolean(schoolId && id), ...base });
  const refresh = () => {
    qc.invalidateQueries({ queryKey: key });
    qc.invalidateQueries({ queryKey: ["admission-sessions", schoolId] });
    qc.invalidateQueries({ queryKey: ["admission-applications", schoolId] });
  };
  const register = useMutation({ mutationFn: (applicationId: string) => phase6Service.registerCandidate(applicationId, id!), onSuccess: refresh });
  const putResults = useMutation({ mutationFn: (r: Array<{ application_id: string; status: "presente" | "ausente"; score?: number }>) => phase6Service.putSessionResults(id!, r), onSuccess: refresh });
  const accessToken = useMutation({ mutationFn: phase6Service.accessToken });
  return { session: q.data, isLoading: q.isLoading, register, putResults, accessToken };
}
