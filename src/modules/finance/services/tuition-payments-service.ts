import api from "@/services/api";

// ---- Tipos (API) ----------------------------------------------------------------------------------------------------

export interface ApiBankAccount {
  id: string;
  bank_name: string;
  account_holder: string;
  iban: string;
  account_number: string | null;
  swift: string | null;
  instructions: string | null;
  is_active: boolean;
  sort_order: number;
}

export type SubmissionStatus = "submetido" | "em_analise" | "aprovado" | "rejeitado" | "substituicao_pedida" | "cancelado";
export type PaymentMethodApi = "transferencia_bancaria" | "multicaixa_express" | "numerario";

export interface ApiSubmission {
  id: string;
  protocol: string;
  status: SubmissionStatus;
  method: PaymentMethodApi;
  total_amount: string;
  confirmed_amount: string | null;
  paid_on: string;
  reference: string | null;
  payer_name: string | null;
  notes: string | null;
  review_reason: string | null;
  student: { id: string; full_name: string };
  submitted_by: { id: string; full_name: string };
  reviewed_by: { id: string | null; full_name: string } | null;
  reviewed_at: string | null;
  bank_account: { id: string | null; bank_name: string } | null;
  proof: { file_name: string; mime_type: string; size_bytes: number; sha256: string };
  items: Array<{ invoice_id: string; amount: string; description: string; due_date: string; payment_id: string | null }>;
  created_at: string;
  updated_at: string;
  waiting_hours: number | null;
}

export interface ApiPayable {
  id: string;
  type: string;
  description: string;
  due_date: string;
  is_overdue: boolean;
  total_due: string;
  balance: string;
  reserved: string;
  available: string;
  payment_reference: string;
  pending_submissions: Array<{ id: string; protocol: string; status: SubmissionStatus }>;
}

export interface SubmissionsSummary {
  by_status: Record<string, { count: number; amount: string }>;
  open: number;
  oldest_open_hours: number | null;
  approved_30d: { count: number; amount: string };
}

export interface FinanceOverview {
  academic_year: { id: string; name: string } | null;
  as_of: string;
  currency: string;
  kpis: {
    billed: string; collected: string; outstanding: string; overdue_amount: string; overdue_count: number; collection_rate: number | null; delinquency_rate: number | null;
    discounts_granted: string; late_fees: string; avg_days_to_pay: number | null; invoices_total: number; invoices_paid: number; students_billed: number;
    students_with_debt: number; debtors_rate: number | null; recovered_30d: string;
  } | null;
  monthly: Array<{ month: string; billed: string; paid_of_billed: string; cash_in: string; rate: number | null }>;
  aging: Array<{ bucket: string; label: string; amount: string; invoices: number }>;
  by_method: Array<{ method: string; label: string; amount: string; payments: number; share: number | null }>;
  by_type: Array<{ type: string; label: string; billed: string; collected: string; rate: number | null }>;
  by_class: Array<{ class_level: string; students: number; billed: string; collected: string; outstanding: string; rate: number | null }>;
  worst_sections: Array<{ section: string; billed: string; collected: string; overdue: string; rate: number | null }>;
  top_debtors: Array<{ student_id: string; full_name: string; section: string; outstanding: string; invoices: number; days_oldest: number }>;
  forecast: Array<{ month: string; expected: string }>;
  submissions: { last_90d: number; open: number; approved: number; rejected: number; avg_review_hours: number | null; online_amount_90d: string } | null;
  reminders_30d: { sent: number; failed: number; skipped: number } | null;
}

export interface ApiEmailLog {
  id: string;
  template_code: string;
  template_name?: string | null;
  recipient: string;
  subject: string;
  status: "pendente" | "enviado" | "falhou" | "ignorado";
  attempts: number;
  error: string | null;
  created_at: string;
  sent_at: string | null;
  school_id: string | null;
}

export interface EmailStats {
  window_days: number;
  sent: number;
  failed: number;
  pending: number;
  skipped: number;
  delivery_rate: number | null;
  top_templates: Array<{ template_code: string; total: number }>;
}

export interface EmailTemplateInfo { code: string; category: string; audience: string; name: string; description: string; essential: boolean }
export interface EmailPreview { code: string; subject: string; preheader: string; html: string; text: string }

export interface NewBankAccount { bankName: string; accountHolder: string; iban: string; accountNumber?: string; swift?: string; instructions?: string }

export interface NewSubmission {
  items: Array<{ invoiceId: string; amount: string }>;
  method: PaymentMethodApi;
  paidOn: string;
  bankAccountId?: string;
  reference?: string;
  payerName?: string;
  notes?: string;
  file: { name: string; mime: "application/pdf" | "image/png" | "image/jpeg"; base64: string };
}

const bankBody = (v: Partial<NewBankAccount>) => ({
  ...(v.bankName !== undefined ? { bank_name: v.bankName } : {}), ...(v.accountHolder !== undefined ? { account_holder: v.accountHolder } : {}),
  ...(v.iban !== undefined ? { iban: v.iban } : {}), ...(v.accountNumber ? { account_number: v.accountNumber } : {}),
  ...(v.swift ? { swift: v.swift } : {}), ...(v.instructions !== undefined ? { instructions: v.instructions } : {}),
});

export const tuitionPaymentsService = {
  // dados bancarios (escola)
  banks: async (): Promise<ApiBankAccount[]> => (await api.get<{ data: ApiBankAccount[] }>("/s/bank-accounts")).data.data,
  createBank: async (v: NewBankAccount) => (await api.post<ApiBankAccount>("/s/bank-accounts", bankBody(v))).data,
  updateBank: async (id: string, v: Partial<NewBankAccount> & { isActive?: boolean }) =>
    (await api.patch<ApiBankAccount>(`/s/bank-accounts/${id}`, { ...bankBody(v), ...(v.isActive !== undefined ? { is_active: v.isActive } : {}) })).data,

  // comprovativos (escola)
  submissions: async (status?: string): Promise<ApiSubmission[]> => (await api.get<{ data: ApiSubmission[] }>("/s/tuition-submissions", { params: { limit: 100, ...(status ? { status } : {}) } })).data.data,
  submissionsSummary: async (): Promise<SubmissionsSummary> => (await api.get<SubmissionsSummary>("/s/tuition-submissions/summary")).data,
  startReview: async (id: string) => (await api.post<ApiSubmission>(`/s/tuition-submissions/${id}/start-review`, {})).data,
  review: async (id: string, v: { decision: "approved" | "rejected" | "replacement_required"; reason?: string; confirmedAmount?: string }) =>
    (await api.post<ApiSubmission>(`/s/tuition-submissions/${id}/review`, { decision: v.decision, ...(v.reason ? { reason: v.reason } : {}), ...(v.confirmedAmount ? { confirmed_amount: v.confirmedAmount } : {}) })).data,
  proofBlob: async (id: string): Promise<Blob> => (await api.get<Blob>(`/s/tuition-submissions/${id}/proof`, { responseType: "blob" })).data,

  // portal (encarregado / aluno)
  portalBanks: async (): Promise<ApiBankAccount[]> => (await api.get<{ data: ApiBankAccount[] }>("/s/portal/bank-accounts")).data.data,
  payables: async (studentId: string): Promise<ApiPayable[]> => (await api.get<{ data: ApiPayable[] }>(`/s/portal/students/${studentId}/payables`)).data.data,
  mySubmissions: async (studentId: string): Promise<ApiSubmission[]> => (await api.get<{ data: ApiSubmission[] }>(`/s/portal/students/${studentId}/payment-submissions`)).data.data,
  submit: async (studentId: string, v: NewSubmission) =>
    (await api.post<ApiSubmission>(`/s/portal/students/${studentId}/payment-submissions`, {
      items: v.items.map((i) => ({ invoice_id: i.invoiceId, amount: i.amount })), method: v.method, paid_on: v.paidOn,
      ...(v.bankAccountId ? { bank_account_id: v.bankAccountId } : {}), ...(v.reference ? { reference: v.reference } : {}), ...(v.payerName ? { payer_name: v.payerName } : {}), ...(v.notes ? { notes: v.notes } : {}),
      file_name: v.file.name, mime_type: v.file.mime, content_base64: v.file.base64,
    })).data,
  replaceProof: async (id: string, file: NewSubmission["file"]) => (await api.post<ApiSubmission>(`/s/portal/payment-submissions/${id}/proof`, { file_name: file.name, mime_type: file.mime, content_base64: file.base64 })).data,
  cancelSubmission: async (id: string) => (await api.post<ApiSubmission>(`/s/portal/payment-submissions/${id}/cancel`, {})).data,
  myProofBlob: async (id: string): Promise<Blob> => (await api.get<Blob>(`/s/portal/payment-submissions/${id}/proof`, { responseType: "blob" })).data,

  // indicadores
  overview: async (academicYearId?: string): Promise<FinanceOverview> => (await api.get<FinanceOverview>("/s/finance/overview", { params: academicYearId ? { academic_year_id: academicYearId } : {} })).data,

  // emails (escola)
  emailLog: async (status?: string): Promise<ApiEmailLog[]> => (await api.get<{ data: ApiEmailLog[] }>("/s/emails/log", { params: { limit: 200, ...(status ? { status } : {}) } })).data.data,
  emailStats: async (): Promise<EmailStats> => (await api.get<EmailStats>("/s/emails/stats")).data,
};

export const adminEmailsService = {
  templates: async () => (await api.get<{ configured: boolean; categories: Record<string, string>; data: EmailTemplateInfo[] }>("/admin/emails/templates")).data,
  preview: async (code: string): Promise<EmailPreview> => (await api.get<EmailPreview>(`/admin/emails/templates/${code}/preview`)).data,
  test: async (code: string, to: string) => (await api.post<{ outcome: string }>("/admin/emails/test", { code, to })).data,
  log: async (status?: string): Promise<ApiEmailLog[]> => (await api.get<{ data: ApiEmailLog[] }>("/admin/emails/log", { params: { limit: 300, ...(status ? { status } : {}) } })).data.data,
  stats: async (): Promise<EmailStats> => (await api.get<EmailStats>("/admin/emails/stats")).data,
  run: async () => (await api.post<Record<string, number>>("/admin/emails/automation/run", {})).data,
};

/** Ficheiro -> base64 (sem o prefixo data:) e tipo validado no cliente (a API volta a validar pelos bytes). */
export async function fileToProof(file: File): Promise<NewSubmission["file"]> {
  const mime = file.type as NewSubmission["file"]["mime"];
  if (!["application/pdf", "image/png", "image/jpeg"].includes(mime)) throw new Error("Só são aceites ficheiros PDF, PNG ou JPEG.");
  if (file.size > 8_000_000) throw new Error("O ficheiro excede 8 MB.");
  const buf = new Uint8Array(await file.arrayBuffer());
  let bin = "";
  for (let i = 0; i < buf.length; i += 0x8000) bin += String.fromCharCode(...buf.subarray(i, i + 0x8000));
  return { name: file.name, mime, base64: btoa(bin) };
}
