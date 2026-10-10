"use client";
import { familyKeys } from "@/modules/family/query-keys";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { portalService } from "@/modules/family/services/portal-service";
import { useActiveSchoolStore } from "@/stores/school/active-school-store";

const forbidden = (e: unknown) => (e as { response?: { status?: number } } | null)?.response?.status === 403;

/** Portal do encarregado/aluno: educandos, notas, avaliacoes (com reapreciacao), facturas e provas. */
export type PortalPart = "wards" | "grades" | "assessments" | "invoices" | "payments" | "timetable" | "attendance" | "documents" | "announcements" | "calendar" | "exams";

/**
 * `parts` limita os pedidos ao que a página usa (omitido = tudo menos as provas, que só o aluno pode ver:
 * um encarregado recebe 403 em /portal/exams).
 */
export function usePortal(studentId?: string, parts?: readonly PortalPart[]) {
  const schoolId = useActiveSchoolStore((s) => s.schoolId);
  const queryClient = useQueryClient();
  const on = Boolean(schoolId);
  const want = (p: PortalPart) => (parts ? parts.includes(p) : p !== "exams");
  const onStudent = (p: PortalPart) => on && Boolean(studentId) && want(p);
  const onSchool = (p: PortalPart) => on && want(p);
  const opts = { staleTime: 30 * 1000, retry: (n: number, e: unknown) => !forbidden(e) && n < 2 };

  const wards = useQuery({ queryKey: familyKeys.wards(schoolId), queryFn: portalService.wards, enabled: on, ...opts });
  const grades = useQuery({ queryKey: familyKeys.grades(schoolId, studentId), queryFn: () => portalService.grades(studentId!), enabled: onStudent("grades"), ...opts });
  const assessments = useQuery({ queryKey: familyKeys.assessments(schoolId, studentId), queryFn: () => portalService.assessments(studentId!), enabled: onStudent("assessments"), ...opts });
  const invoices = useQuery({ queryKey: familyKeys.invoices(schoolId, studentId), queryFn: () => portalService.invoices(studentId!), enabled: onStudent("invoices"), ...opts });
  const payments = useQuery({ queryKey: familyKeys.paymentsHistory(schoolId, studentId), queryFn: () => portalService.payments(studentId!), enabled: onStudent("payments"), ...opts });
  const timetable = useQuery({ queryKey: familyKeys.timetable(schoolId, studentId), queryFn: () => portalService.timetable(studentId!), enabled: onStudent("timetable"), ...opts });
  const attendance = useQuery({ queryKey: familyKeys.attendance(schoolId, studentId), queryFn: () => portalService.attendance(studentId!), enabled: onStudent("attendance"), ...opts });
  const documents = useQuery({ queryKey: familyKeys.documents(schoolId, studentId), queryFn: () => portalService.documents(studentId!), enabled: onStudent("documents"), ...opts });
  const announcements = useQuery({ queryKey: familyKeys.announcements(schoolId), queryFn: portalService.announcements, enabled: onSchool("announcements"), ...opts });
  const calendar = useQuery({ queryKey: familyKeys.calendar(schoolId), queryFn: portalService.calendar, enabled: onSchool("calendar"), ...opts });
  const exams = useQuery({ queryKey: familyKeys.exams(schoolId), queryFn: portalService.exams, enabled: onSchool("exams"), ...opts });

  const refreshReviews = () => queryClient.invalidateQueries({ queryKey: familyKeys.assessments(schoolId, studentId) });
  const requestReview = useMutation({ mutationFn: (v: { assessmentId: string; reason: string }) => portalService.requestReview(studentId!, v.assessmentId, v.reason), onSuccess: refreshReviews });
  const cancelReview = useMutation({ mutationFn: (id: string) => portalService.cancelReview(studentId!, id), onSuccess: refreshReviews });

  return {
    wards: wards.data ?? [], wardsLoading: wards.isLoading,
    grades: grades.data ?? [], gradesForbidden: forbidden(grades.error), gradesLoading: grades.isLoading,
    assessments: assessments.data ?? [],
    invoices: invoices.data ?? [], invoicesForbidden: forbidden(invoices.error),
    payments: payments.data ?? [], paymentsLoading: payments.isLoading,
    exams: exams.data ?? [],
    timetable: timetable.data ?? [], attendance: attendance.data, documents: documents.data ?? [], announcements: announcements.data ?? [], calendar: calendar.data ?? [], attendanceForbidden: forbidden(attendance.error),
    requestReview, cancelReview,
  };
}
