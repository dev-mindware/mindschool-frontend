"use client";
import { familyKeys } from "@/modules/family/query-keys";
import { financeKeys } from "@/modules/finance/query-keys";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminEmailsService, tuitionPaymentsService, type NewBankAccount, type NewSubmission } from "@/modules/finance/services/tuition-payments-service";
import { useActiveSchoolStore } from "@/stores/school/active-school-store";

const STALE = 30 * 1000;

/** Dados bancarios da escola (gestao) — alteracoes avisam o titular por email. */
export function useBankAccounts() {
  const schoolId = useActiveSchoolStore((s) => s.schoolId);
  const qc = useQueryClient();
  const key = financeKeys.bankAccounts(schoolId);
  const q = useQuery({ queryKey: key, queryFn: tuitionPaymentsService.banks, enabled: Boolean(schoolId), staleTime: STALE, retry: false });
  const refresh = () => qc.invalidateQueries({ queryKey: key });
  const create = useMutation({ mutationFn: (v: NewBankAccount) => tuitionPaymentsService.createBank(v), onSuccess: refresh });
  const update = useMutation({ mutationFn: (v: { id: string; data: Partial<NewBankAccount> & { isActive?: boolean } }) => tuitionPaymentsService.updateBank(v.id, v.data), onSuccess: refresh });
  return { accounts: q.data ?? [], isLoading: q.isLoading, isError: q.isError, create, update };
}

/** Fila de comprovativos de propinas (equipa financeira). */
export function useTuitionSubmissions() {
  const schoolId = useActiveSchoolStore((s) => s.schoolId);
  const qc = useQueryClient();
  const refresh = () => {
    qc.invalidateQueries({ queryKey: financeKeys.submissions(schoolId) });
    qc.invalidateQueries({ queryKey: financeKeys.fees(schoolId) });
    qc.invalidateQueries({ queryKey: financeKeys.overviewAll(schoolId) });
  };
  const list = useQuery({ queryKey: financeKeys.submissionsList(schoolId), queryFn: () => tuitionPaymentsService.submissions(), enabled: Boolean(schoolId), staleTime: 15 * 1000, retry: false });
  const summary = useQuery({ queryKey: financeKeys.submissionsSummary(schoolId), queryFn: tuitionPaymentsService.submissionsSummary, enabled: Boolean(schoolId), staleTime: 15 * 1000, retry: false });
  const start = useMutation({ mutationFn: (id: string) => tuitionPaymentsService.startReview(id), onSuccess: refresh });
  const review = useMutation({ mutationFn: (v: { id: string; decision: "approved" | "rejected" | "replacement_required"; reason?: string; confirmedAmount?: string }) => tuitionPaymentsService.review(v.id, v), onSuccess: refresh });
  return { submissions: list.data ?? [], summary: summary.data, isLoading: list.isLoading, isError: list.isError, refetch: list.refetch, start, review };
}

/** Pagamento pelo encarregado/aluno: contas da escola, faturas por pagar e comprovativos do educando. */
export function usePortalPayments(studentId?: string) {
  const schoolId = useActiveSchoolStore((s) => s.schoolId);
  const qc = useQueryClient();
  const on = Boolean(schoolId && studentId);
  const refresh = () => {
    qc.invalidateQueries({ queryKey: financeKeys.portalPay(schoolId, studentId) });
    qc.invalidateQueries({ queryKey: familyKeys.invoices(schoolId, studentId) });
  };
  const banks = useQuery({ queryKey: financeKeys.portalBanks(schoolId), queryFn: tuitionPaymentsService.portalBanks, enabled: Boolean(schoolId), staleTime: 60 * 1000, retry: false });
  const payables = useQuery({ queryKey: financeKeys.portalPayables(schoolId, studentId), queryFn: () => tuitionPaymentsService.payables(studentId!), enabled: on, staleTime: STALE, retry: false });
  const submissions = useQuery({ queryKey: financeKeys.portalSubmissions(schoolId, studentId), queryFn: () => tuitionPaymentsService.mySubmissions(studentId!), enabled: on, staleTime: STALE, retry: false });
  const submit = useMutation({ mutationFn: (v: NewSubmission) => tuitionPaymentsService.submit(studentId!, v), onSuccess: refresh });
  const replace = useMutation({ mutationFn: (v: { id: string; file: NewSubmission["file"] }) => tuitionPaymentsService.replaceProof(v.id, v.file), onSuccess: refresh });
  const cancel = useMutation({ mutationFn: (id: string) => tuitionPaymentsService.cancelSubmission(id), onSuccess: refresh });
  return {
    banks: banks.data ?? [], payables: payables.data ?? [], submissions: submissions.data ?? [], isLoading: payables.isLoading || submissions.isLoading,
    forbidden: payables.isError, submit, replace, cancel,
  };
}

export function useFinanceOverview(academicYearId?: string) {
  const schoolId = useActiveSchoolStore((s) => s.schoolId);
  return useQuery({ queryKey: financeKeys.overview(schoolId, academicYearId), queryFn: () => tuitionPaymentsService.overview(academicYearId), enabled: Boolean(schoolId), staleTime: 60 * 1000, retry: false });
}

/** Registo e indicadores de emails da escola (titular / financeiro). */
export function useSchoolEmails() {
  const schoolId = useActiveSchoolStore((s) => s.schoolId);
  const log = useQuery({ queryKey: financeKeys.schoolEmailLog(schoolId), queryFn: () => tuitionPaymentsService.emailLog(), enabled: Boolean(schoolId), staleTime: STALE, retry: false });
  const stats = useQuery({ queryKey: financeKeys.schoolEmailStats(schoolId), queryFn: tuitionPaymentsService.emailStats, enabled: Boolean(schoolId), staleTime: STALE, retry: false });
  return { log: log.data ?? [], stats: stats.data, isLoading: log.isLoading, isError: log.isError };
}

/** Centro de emails da plataforma (administracao do sistema). */
export function useAdminEmails() {
  const qc = useQueryClient();
  const templates = useQuery({ queryKey: financeKeys.adminEmailTemplates(), queryFn: adminEmailsService.templates, staleTime: 5 * 60 * 1000, retry: false });
  const log = useQuery({ queryKey: financeKeys.adminEmailLog(), queryFn: () => adminEmailsService.log(), staleTime: STALE, retry: false });
  const stats = useQuery({ queryKey: financeKeys.adminEmailStats(), queryFn: adminEmailsService.stats, staleTime: STALE, retry: false });
  const refresh = () => { qc.invalidateQueries({ queryKey: financeKeys.adminEmailLog() }); qc.invalidateQueries({ queryKey: financeKeys.adminEmailStats() }); };
  const test = useMutation({ mutationFn: (v: { code: string; to: string }) => adminEmailsService.test(v.code, v.to), onSuccess: refresh });
  const run = useMutation({ mutationFn: adminEmailsService.run, onSuccess: refresh });
  return { templates: templates.data, log: log.data ?? [], stats: stats.data, isLoading: templates.isLoading, test, run };
}
