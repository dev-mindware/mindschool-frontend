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
  const resendInvite = useMutation({ mutationFn: adminSchoolService.resendInvite });
  return { members: q.data ?? [], isLoading: q.isLoading, forbidden: forbidden(q.error), grant, revoke, resendInvite };
}

export function useSchoolRolesAndPermissions() {
  const schoolId = useActiveSchoolStore((s) => s.schoolId);
  const qc = useQueryClient();
  const rolesQuery = useQuery({
    queryKey: ["school-roles", schoolId],
    queryFn: adminSchoolService.roles,
    enabled: Boolean(schoolId),
    ...opts,
  });
  const catalogQuery = useQuery({
    queryKey: ["permissions-catalog", schoolId],
    queryFn: adminSchoolService.permissionsCatalog,
    enabled: Boolean(schoolId),
    ...opts,
  });
  const auditQuery = useQuery({
    queryKey: ["roles-audit", schoolId],
    queryFn: () => adminSchoolService.rolesAudit(50),
    enabled: Boolean(schoolId),
    ...opts,
  });
  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["school-roles", schoolId] });
    qc.invalidateQueries({ queryKey: ["roles-audit", schoolId] });
    qc.invalidateQueries({ queryKey: ["effective-permissions", schoolId] });
  };
  const updateRole = useMutation({ mutationFn: adminSchoolService.updateRolePermissions, onSuccess: refresh });
  const resetRole = useMutation({ mutationFn: adminSchoolService.resetRolePermissions, onSuccess: refresh });

  return {
    roles: rolesQuery.data?.data ?? [],
    authzVersion: rolesQuery.data?.authz_version ?? 1,
    catalog: catalogQuery.data?.data ?? [],
    modules: catalogQuery.data?.modules ?? [],
    auditEntries: auditQuery.data?.data ?? [],
    isLoading: rolesQuery.isLoading || catalogQuery.isLoading,
    isAuditLoading: auditQuery.isLoading,
    updateRole,
    resetRole,
  };
}

export function useEffectivePermissions(membershipId: string | null) {
  const schoolId = useActiveSchoolStore((s) => s.schoolId);
  return useQuery({
    queryKey: ["effective-permissions", schoolId, membershipId],
    queryFn: () => adminSchoolService.effectivePermissions(membershipId!),
    enabled: Boolean(schoolId && membershipId),
    ...opts,
  });
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
