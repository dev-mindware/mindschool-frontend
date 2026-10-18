import type { ApiPlan } from "@/services/subscription-service";
import { formatCurrencyCompact } from "@/utils";

export const kz = (v: string | number) => formatCurrencyCompact(v);

export const FEATURE_LABEL: Record<string, string> = {
  exams_full: "Provas online e exames completos",
  email_collections: "Cobrança e avisos por e-mail", portal: "Portal do aluno e do encarregado",
  reports_advanced: "Relatórios avançados", multi_school: "Multi-escola com painel do grupo",
  sla_support: "Suporte dedicado e SLA", bi_analytics: "BI & Analytics: tendências por ano lectivo", archive_advanced: "Arquivo documental: pesquisa, retenção e pacotes", timetable_solver: "Gerador automático de horários", calendar_general: "Calendário geral da escola",
  google_calendar: "Integração com o Google Calendar", rooms: "Gestão de salas", lessons_summaries: "Aulas, substituições e sumários",
  risk_alerts: "Alerta de risco de abandono", teacher_attendance: "Assiduidade docente com QR Code", school_services: "Saúde, transporte e extracurriculares",
};

const QUOTA_LABEL: Record<string, string> = { students: "alunos", users: "utilizadores", teachers: "professores", sections: "turmas", exports_month: "exportações por mês", academic_years_active: "anos lectivos activos", storage_mb: "de armazenamento" };

export const fmtQuota = (key: string, limit: number | null) => {
  if (limit === null) return `${QUOTA_LABEL[key] ?? key} ilimitados`.replace(/^./, (c) => c.toUpperCase());
  return key === "storage_mb" ? `${limit / 1024} GB ${QUOTA_LABEL[key]}` : `${limit.toLocaleString("pt-AO")} ${QUOTA_LABEL[key] ?? key}`;
};

/** Os limites de cada plano, por ordem de importância para quem escolhe. */
export const QUOTA_ORDER = ["students", "users", "teachers", "sections", "academic_years_active", "exports_month", "storage_mb"] as const;

export const PERIODS = [
  { value: 1, label: "Mensal", hint: "1 mês" },
  { value: 6, label: "Semestral", hint: "6 meses" },
  { value: 12, label: "Anual", hint: "12 meses (2 meses grátis)" },
] as const;

/** Linhas curtas do cartão: o essencial (alunos, utilizadores) e uma referência ao resto. O pormenor vai para o modal. */
export function planHighlights(plan: ApiPlan, previous?: ApiPlan): string[] {
  const out = [fmtQuota("students", plan.limits.students?.limit ?? null), fmtQuota("users", plan.limits.users?.limit ?? null)];
  if (previous) out.push(`Tudo do plano ${previous.name}`);
  const extra = plan.features.filter((f) => !previous?.features.includes(f)).length;
  if (extra > 0) out.push(`+ ${extra} funcionalidade${extra > 1 ? "s" : ""} adicional${extra > 1 ? "is" : ""}`);
  return out;
}
