"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminSchoolService, type AuditFilters, type ImportKind, type SchoolRole, type TeacherStatus } from "@/services/admin-school-service";
import { useActiveSchoolStore } from "@/stores/school/active-school-store";

const forbidden = (e: unknown) => (e as { response?: { status?: number } } | null)?.response?.status === 403;
const opts = { staleTime: 30 * 1000, retry: (n: number, e: unknown) => !forbidden(e) && n < 2 };

export function useMemberships() {
  const schoolId = useActiveSchoolStore((s) => s.schoolId);
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["memberships", schoolId], queryFn: adminSchoolService.memberships, enabled: Boolean(schoolId), ...opts });
  const refresh = () => qc.invalidateQueries({ queryKey: ["memberships", schoolId] });
  const grant = useMutation({ mutationFn: adminSchoolService.grant, onSuccess: refresh });
  const revoke = useMutation({ mutationFn: adminSchoolService.revoke, onSuccess: refresh });
  return { members: q.data ?? [], isLoading: q.isLoading, forbidden: forbidden(q.error), grant, revoke };
}

export function useTeachersAdmin() {
  const schoolId = useActiveSchoolStore((s) => s.schoolId);
  const qc = useQueryClient();
  const teachers = useQuery({ queryKey: ["teachers-admin", schoolId], queryFn: adminSchoolService.teachers, enabled: Boolean(schoolId), ...opts });
  const members = useQuery({ queryKey: ["memberships", schoolId], queryFn: adminSchoolService.memberships, enabled: Boolean(schoolId), ...opts });
  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["teachers-admin", schoolId] });
    qc.invalidateQueries({ queryKey: ["teachers", schoolId] });
  };
  const create = useMutation({ mutationFn: adminSchoolService.createTeacher, onSuccess: refresh });
  const update = useMutation({ mutationFn: (v: { id: string; status?: TeacherStatus; documentNumber?: string; qualification?: string | null }) => adminSchoolService.updateTeacher(v.id, v), onSuccess: refresh });
  const linked = new Set((teachers.data ?? []).map((t) => t.user_id));
  const candidates = (members.data ?? []).filter((m) => m.role === "professor" && !linked.has(m.user.id));
  return { teachers: teachers.data ?? [], isLoading: teachers.isLoading, forbidden: forbidden(teachers.error), candidates, create, update };
}

export function useTeacherCredentials(teacherId: string | undefined) {
  const schoolId = useActiveSchoolStore((s) => s.schoolId);
  const qc = useQueryClient();
  const key = ["teacher-credentials", schoolId, teacherId];
  const q = useQuery({ queryKey: key, queryFn: () => adminSchoolService.credentials(teacherId!), enabled: Boolean(schoolId && teacherId), ...opts });
  const refresh = () => qc.invalidateQueries({ queryKey: key });
  const issue = useMutation({ mutationFn: (t: "app_dinamico" | "cartao_fisico") => adminSchoolService.issueCredential(teacherId!, t), onSuccess: refresh });
  const block = useMutation({ mutationFn: (v: { id: string; reason: string }) => adminSchoolService.blockCredential(v.id, v.reason), onSuccess: refresh });
  return { credentials: q.data ?? [], isLoading: q.isLoading, issue, block };
}

export function useAudit(filters: AuditFilters) {
  const schoolId = useActiveSchoolStore((s) => s.schoolId);
  const key = JSON.stringify(filters);
  const q = useQuery({ queryKey: ["audit", schoolId, key], queryFn: () => adminSchoolService.audit(filters), enabled: Boolean(schoolId), ...opts });
  return { events: q.data?.data ?? [], hasMore: Boolean(q.data?.page.has_more), isLoading: q.isLoading, forbidden: forbidden(q.error) };
}

export function useImports(kind: ImportKind) {
  const schoolId = useActiveSchoolStore((s) => s.schoolId);
  const qc = useQueryClient();
  const validate = useMutation({ mutationFn: (v: { csv: string; filename: string; assessmentId?: string }) => adminSchoolService.validateImport(kind, v.csv, v.filename, { assessmentId: v.assessmentId }) });
  const commit = useMutation({ mutationFn: (v: { id: string; policy: "all_or_nothing" | "valid_rows_only" }) => adminSchoolService.commitImport(kind, v.id, v.policy), onSuccess: () => qc.invalidateQueries({ queryKey: ["students", schoolId] }) });
  return { validate, commit };
}
