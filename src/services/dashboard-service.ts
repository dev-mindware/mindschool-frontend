import api from "./api";

/** Linhas dos relatórios do catálogo (API) usadas nos dashboards. */
export interface StudentsByStatusRow { status: string; total: number }
export interface EnrollmentSituationRow { academic_year: string; class_level: string; section: string; status: string; total: number }
export interface AttendanceSummaryRow { section: string; present: number; late: number; justified: number; unjustified: number; attendance_rate: number }
export interface ReceiptRow { date: string; method: string; payments: number; total: string }
export interface DebtRow { student: string; invoices: number; balance: string; oldest_due_date: string; days_overdue: number }
export interface MyTimetableEntry { id?: string; start: string; end: string; subject: { name: string }; section?: { name: string }; room?: { code: string } | null; teacher?: { full_name: string } }

export const dashboardService = {
  /** Pré-visualização de um relatório (403 = o papel não tem acesso: o bloco do dashboard fica escondido). */
  report: async <T>(code: string, filters: Record<string, unknown> = {}): Promise<T[]> =>
    (await api.post<{ data: T[] }>(`/s/reports/${code}/preview`, { filters })).data.data,

  /** Horário do utilizador autenticado (professor): aulas por dia da semana. */
  myTimetable: async (): Promise<Array<{ weekday: number; entries: MyTimetableEntry[] }>> => {
    const { data } = await api.get<{ days?: Array<{ weekday: number; entries: MyTimetableEntry[] }> }>("/s/timetable/me");
    return data.days ?? [];
  },
};
