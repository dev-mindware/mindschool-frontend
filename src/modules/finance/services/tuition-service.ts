import api from "@/services/api";
import { patchSettings } from "@/services/school-settings-service";
import { fetchAllPages } from "@/services/api-pagination";
import { enrollmentsService } from "@/services/enrollments-service";
import { studentsService } from "@/services/students-service";
import { guardiansService } from "@/services/guardians-service";
import type { StudentTuitionFee, TuitionFinancialSummary, TuitionPlan, TuitionStatus } from "@/modules/finance/types";

// ---- API ----------------------------------------------------------------------------------------------------------

export interface ReminderBatchResult {
  sent: number;
  failed: number;
  cancelled: number;
  results: Array<{ invoice_id: string; status: string; recipient: string | null; error: string | null }>;
}

export interface ApiInvoice {
  id: string;
  student: { id: string; full_name: string };
  type: "matricula" | "propina_mensal" | "servico_extra" | "multa";
  status: "emitida" | "parcialmente_paga" | "paga" | "vencida" | "anulada";
  amount: string;
  discount_amount: string;
  late_fee_amount: string;
  total_due: string;
  paid_amount: string;
  balance: string;
  due_date: string;
  payment_reference: string;
  is_overdue: boolean;
  related_invoice_id?: string | null;
  fiscal: {
    status: string; document_id?: string | null; certificate_number: string | null;
    /** Nota(s) de crédito emitida(s) no MindGest sobre a fatura-recibo desta cobrança. */
    corrected?: boolean; correction_notice?: string | null; credit_notes?: Array<{ id: string; number: string | null; issued_at: string | null }>;
  };
}

interface ApiFinanceSettings {
  currency?: string;
  enrollment_fee?: string | null;
  monthly_fee?: string | null;
  installments?: number;
  due_start_day?: number;
  due_day?: number;
  grace_days?: number;
  late_fee?: {
    type: "fixed" | "percentage";
    value: string;
    grace_days: number;
    monthly_increase_type?: "fixed" | "percentage";
    monthly_increase_value?: string;
  } | null;
  custom_emoluments?: Array<{
    id: string;
    code: string;
    name: string;
    price: string;
    delivery_days: number;
    requires_payment: boolean;
    description?: string;
    active: boolean;
  }>;
  email_collections?: {
    enabled?: boolean;
    pre_due_days?: number;
    grace_warning?: boolean;
    penalty_notification?: boolean;
    monthly_followup?: boolean;
    send_hour?: string;
    templates?: Record<string, { subject?: string; body?: string }>;
  };
}

const MONTHS = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

const STATUS: Record<ApiInvoice["status"], TuitionStatus> = {
  paga: "PAID",
  vencida: "OVERDUE",
  emitida: "PENDING",
  parcialmente_paga: "PENDING",
  anulada: "EXEMPT",
};

export { METHOD_TO_API, type UiPaymentMethod } from "@/modules/finance/settlement-model";

const money = (v: string) => Number(v);

export const tuitionService = {
  /** Faturas da escola (leitura): a emissão e certificação fiscal são tratadas no MindGest. */
  invoices: (): Promise<ApiInvoice[]> => fetchAllPages<ApiInvoice>("/s/invoices"),
  /** Abre o comprovativo interno (PDF) do último pagamento da fatura. */
  openReceipt: async (invoiceId: string): Promise<void> => {
    const pays = (await api.get<{ data: Array<{ id: string }> }>(`/s/invoices/${invoiceId}/payments`)).data.data;
    const last = pays[pays.length - 1];
    if (!last) throw new Error("Esta fatura ainda não tem pagamentos.");
    const blob = (await api.get<Blob>(`/s/invoices/${invoiceId}/payments/${last.id}/receipt.pdf`, { responseType: "blob" })).data;
    window.open(URL.createObjectURL(blob), "_blank");
  },

  /** Faturas de propina/matricula da escola ativa, enriquecidas com turma e encarregado (juncao com alunos e matriculas). */
  fees: async (): Promise<StudentTuitionFee[]> => {
    const [invoices, students, enrollments, guardians] = await Promise.all([
      fetchAllPages<ApiInvoice>("/s/invoices"), studentsService.list(), enrollmentsService.list(),
      // sem permissao de ler encarregados (ou falha): as faturas continuam a listar-se, so sem o e-mail
      guardiansService.list().catch(() => []),
    ]);
    const studentBy = new Map(students.map((s) => [s.id, s]));
    const emailByGuardian = new Map(guardians.map((g) => [g.id, g.email]));
    const sectionBy = new Map(enrollments.filter((e) => e.status === "ACTIVE").map((e) => [e.studentId, e.sectionName]));
    // A multa (e cada agravamento mensal) e uma fatura propria ligada a de origem: soma-se aqui a quem a originou.
    const finesBy = new Map<string, ApiInvoice[]>();
    for (const f of invoices) {
      if (f.type !== "multa" || f.status === "anulada" || !f.related_invoice_id) continue;
      finesBy.set(f.related_invoice_id, [...(finesBy.get(f.related_invoice_id) ?? []), f]);
    }
    return invoices
      .filter((i) => i.status !== "anulada" && (i.type === "propina_mensal" || i.type === "matricula"))
      .map((i) => {
        const due = new Date(`${i.due_date}T00:00:00Z`);
        const st = studentBy.get(i.student.id);
        const fines = finesBy.get(i.id) ?? [];
        const openFines = fines.filter((f) => money(f.balance) > 0).map((f) => ({ id: f.id, balance: money(f.balance) }));
        const finesOwed = openFines.reduce((a, f) => a + f.balance, 0);
        const baseBalance = money(i.balance);
        const owed = baseBalance + finesOwed;
        // factura paga mas com multa por pagar: continua em divida
        const overdue = (i.is_overdue && i.status !== "paga") || (i.status === "paga" && finesOwed > 0);
        return {
          id: i.id,
          studentId: i.student.id,
          studentName: i.student.full_name,
          studentNumber: st?.studentNumber ?? "",
          classSection: sectionBy.get(i.student.id) ?? "",
          month: due.getUTCMonth() + 1,
          year: due.getUTCFullYear(),
          monthLabel: i.type === "matricula" ? "Matrícula" : MONTHS[due.getUTCMonth()]!,
          baseAmount: money(i.amount),
          discountAmount: money(i.discount_amount),
          penaltyAmount: money(i.late_fee_amount) + fines.reduce((a, f) => a + money(f.amount), 0),
          totalAmount: owed > 0 ? owed : money(i.total_due) + fines.reduce((a, f) => a + money(f.amount), 0),
          baseBalance,
          penalties: openFines,
          dueDate: i.due_date,
          status: overdue ? "OVERDUE" : STATUS[i.status],
          receiptNumber: i.fiscal.certificate_number ?? undefined,
          guardianName: st?.guardianName ?? "",
          guardianPhone: st?.guardianPhone ?? "",
          guardianEmail: st?.guardianId ? emailByGuardian.get(st.guardianId) : undefined,
        } satisfies StudentTuitionFee;
      })
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  },

  /** Envia agora o lembrete de cobranca (e-mail) a cada fatura; devolve o resultado real, factura a fatura. */
  sendReminders: async (invoiceIds: string[]): Promise<ReminderBatchResult> => {
    const total: ReminderBatchResult = { sent: 0, failed: 0, cancelled: 0, results: [] };
    for (let i = 0; i < invoiceIds.length; i += 200) { // a API aceita ate 200 faturas por pedido
      const { data } = await api.post<ReminderBatchResult>("/s/finance/reminders/send", { invoice_ids: invoiceIds.slice(i, i + 200), channel: "email" });
      total.sent += data.sent; total.failed += data.failed; total.cancelled += data.cancelled; total.results.push(...data.results);
    }
    return total;
  },

  /** Comprovativo interno (PDF) de um pagamento. */
  receiptBlob: async (invoiceId: string, paymentId: string): Promise<Blob> =>
    (await api.get(`/s/invoices/${invoiceId}/payments/${paymentId}/receipt.pdf`, { responseType: "blob" })).data,

  /** A "tabela de precos" e a politica financeira da escola (`settings.finance`): uma por escola. */
  plans: async (): Promise<TuitionPlan[]> => {
    const { data } = await api.get<{ settings: { finance?: ApiFinanceSettings } }>("/s");
    const f = data.settings?.finance ?? {};
    if (!f.monthly_fee && !f.enrollment_fee && !f.due_day) return [];
    const lf = f.late_fee;
    return [
      {
        id: "school-finance",
        name: "Tabela de propinas da escola",
        educationCycle: "LOWER_SECONDARY",
        classLevel: "Todas as classes",
        monthlyAmount: Number(f.monthly_fee ?? 0),
        registrationFee: Number(f.enrollment_fee ?? 0),
        reEnrollmentFee: 0,
        siblingsDiscountPercent: 0,
        dueStartDay: f.due_start_day ?? 1,
        dueDay: f.due_day ?? 20,
        penaltyGracePeriodDays: f.grace_days ?? (lf?.grace_days ?? 2),
        latePenaltyType: lf?.type ?? "percentage",
        latePenaltyPercent: lf?.type === "percentage" ? Number(lf.value) : 0,
        latePenaltyValue: Number(lf?.value ?? 0),
        monthlyIncreaseType: lf?.monthly_increase_type ?? "percentage",
        monthlyIncreaseValue: Number(lf?.monthly_increase_value ?? 0),
        customEmoluments: (f.custom_emoluments ?? []).map((e) => ({
          id: e.id,
          code: e.code,
          name: e.name,
          description: e.description,
          price: Number(e.price),
          deliveryDays: e.delivery_days,
          requiresPayment: e.requires_payment,
          active: e.active,
        })),
        emailCollections: {
          enabled: f.email_collections?.enabled ?? true,
          preDueDays: f.email_collections?.pre_due_days ?? 5,
          graceWarning: f.email_collections?.grace_warning ?? true,
          penaltyNotification: f.email_collections?.penalty_notification ?? true,
          monthlyFollowup: f.email_collections?.monthly_followup ?? true,
          sendHour: f.email_collections?.send_hour ?? "08:00",
          templates: f.email_collections?.templates,
        },
        academicYear: "",
        currency: "AOA",
        isActive: true,
        createdAt: "",
        updatedAt: "",
      },
    ];
  },

  savePlan: async (v: {
    monthlyAmount: number;
    registrationFee: number;
    dueStartDay?: number;
    dueDay?: number;
    graceDays?: number;
    latePenaltyType?: "percentage" | "fixed";
    latePenaltyValue?: number;
    latePenaltyPercent?: number;
    penaltyGracePeriodDays?: number;
    monthlyIncreaseType?: "percentage" | "fixed";
    monthlyIncreaseValue?: number;
    customEmoluments?: Array<{
      id: string;
      code: string;
      name: string;
      price: number;
      deliveryDays: number;
      requiresPayment: boolean;
      description?: string;
      active: boolean;
    }>;
    emailCollections?: {
      enabled: boolean;
      preDueDays: number;
      graceWarning: boolean;
      penaltyNotification: boolean;
      monthlyFollowup: boolean;
      sendHour?: string;
      templates?: Record<string, { subject?: string; body?: string }>;
    };
  }): Promise<void> => {
    const penaltyVal = v.latePenaltyValue ?? v.latePenaltyPercent ?? 0;
    const grace = v.graceDays ?? v.penaltyGracePeriodDays ?? 2;
    await patchSettings({
      finance: {
        monthly_fee: v.monthlyAmount.toFixed(2),
        enrollment_fee: v.registrationFee.toFixed(2),
        due_start_day: v.dueStartDay ?? 1,
        due_day: v.dueDay ?? 20,
        grace_days: grace,
        late_fee:
          penaltyVal > 0
            ? {
                policy_version: "2",
                type: v.latePenaltyType ?? "percentage",
                value: String(penaltyVal),
                grace_days: grace,
                monthly_increase_type: v.monthlyIncreaseType ?? "percentage",
                monthly_increase_value: String(v.monthlyIncreaseValue ?? 0),
              }
            : null,
        ...(v.customEmoluments
          ? {
              custom_emoluments: v.customEmoluments.map((e) => ({
                id: e.id,
                code: e.code,
                name: e.name,
                price: e.price.toFixed(2),
                delivery_days: e.deliveryDays,
                requires_payment: e.requiresPayment,
                description: e.description,
                active: e.active,
              })),
            }
          : {}),
        ...(v.emailCollections
          ? {
              email_collections: {
                enabled: v.emailCollections.enabled,
                pre_due_days: v.emailCollections.preDueDays,
                grace_warning: v.emailCollections.graceWarning,
                penalty_notification: v.emailCollections.penaltyNotification,
                monthly_followup: v.emailCollections.monthlyFollowup,
                ...(v.emailCollections.sendHour ? { send_hour: v.emailCollections.sendHour } : {}),
                ...(v.emailCollections.templates ? { templates: v.emailCollections.templates } : {}),
              },
            }
          : {}),
      },
    });
  },

  summary: (fees: StudentTuitionFee[]): TuitionFinancialSummary => {
    const sum = (f: (x: StudentTuitionFee) => boolean) => fees.filter(f).reduce((a, x) => a + x.totalAmount, 0);
    const expected = fees.reduce((a, x) => a + x.baseAmount + x.penaltyAmount - x.discountAmount, 0);
    const collected = sum((x) => x.status === "PAID");
    const debtors = new Set(fees.filter((x) => x.status === "OVERDUE").map((x) => x.studentId));
    const all = new Set(fees.map((x) => x.studentId));
    return {
      totalExpectedAmount: expected,
      totalCollectedAmount: collected,
      totalPendingAmount: sum((x) => x.status === "PENDING"),
      totalOverdueAmount: sum((x) => x.status === "OVERDUE"),
      collectionRatePercent: expected > 0 ? Number(((collected / expected) * 100).toFixed(1)) : 0,
      studentsInDebtCount: debtors.size,
      studentsUpToDateCount: all.size - debtors.size,
      academicYear: "",
    };
  },
};
