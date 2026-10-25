import type { PlanType, Role } from "@/types";

/**
 * REGISTO ÚNICO DE NAVEGAÇÃO. Cada página da aplicação é declarada UMA vez, aqui: etiqueta, rota, ícone, papéis, plano
 * mínimo e posição (módulo › secção). Daqui derivam o menu (`menu-items.tsx`), a estrutura modular da sidebar, o
 * breadcrumb e o controlo de acesso por rota (`lib/find-menu-item.ts`). Para acrescentar uma página, edita-se só este ficheiro.
 *
 * Regras de apresentação: no máximo 8 páginas por módulo (testado); «Início» é a dashboard do papel; «Configurações» é
 * sempre o último módulo.
 */

export type ModuleId =
  | "inicio" | "secretaria" | "academico" | "avaliacao" | "vida" | "financeiro" | "relatorios" | "configuracoes"
  | "acompanhamento" | "servicos" | "conta" | "outros";

export type Audience = "school" | "family";

export interface SectionDef {
  /** Sem rótulo, as páginas ficam soltas no módulo. */
  label?: string;
  /** Ícone do grupo no menu em acordeão (por omissão, o do módulo). */
  icon?: string;
  /** Mostrar as páginas soltas no menu em acordeão, mesmo tendo rótulo (o rótulo só serve de secção do módulo). */
  loose?: boolean;
  /** Papéis que veem o grupo no menu em acordeão (por omissão, os de qualquer página do grupo). */
  groupRoles?: readonly Role[];
}

export interface ModuleDef {
  id: ModuleId;
  label: string;
  icon: string;
  audience: Audience;
  sections: readonly SectionDef[];
}

export interface PageDef {
  name: string;
  url: string;
  icon: string;
  module: ModuleId;
  /** Rótulo da secção dentro do módulo (tem de existir em `MODULES`). */
  section?: string;
  roles: readonly Role[];
  /** Plano mínimo (rótulo do upsell). Sem ele a página é núcleo: está em todos os planos. */
  minPlan?: PlanType;
  /** Feature da API que a página exige; decide o acesso quando a sessão já conhece as features contratadas. */
  feature?: string;
  /** Página acima do plano que se mostra com cadeado como montra de upgrade; as restantes ficam ocultas. */
  teaser?: boolean;
}

// ---- Papéis -------------------------------------------------------------------------------------------------------
const MGMT: Role[] = ["DIRECTOR_GENERAL", "OWNER", "MANAGER", "ADMIN"];
const FAMILY: Role[] = ["GUARDIAN", "STUDENT"];
/** Todos os papéis da escola (tudo menos a família). */
export const SCHOOL_ROLES: readonly Role[] = [...MGMT, "PEDAGOGIC_DIRECTOR", "SECRETARY", "FINANCIAL", "TEACHER", "MED_AUDITOR", "SYSTEM_ADMIN"];
const PEDAGOGY: Role[] = [...MGMT, "PEDAGOGIC_DIRECTOR", "SECRETARY"]; // gestão + direcção pedagógica + secretaria
const PEDAGOGY_T: Role[] = [...PEDAGOGY, "TEACHER"];

// ---- Módulos (por ordem no rail) ----------------------------------------------------------------------------------
export const MODULES: readonly ModuleDef[] = [
  { id: "inicio", label: "Início", icon: "House", audience: "school", sections: [{}] },
  {
    id: "secretaria", label: "Secretaria", icon: "Users", audience: "school",
    sections: [
      // O grupo no menu em acordeão não inclui Professores (as «Sessões» da prova de acesso mantêm essa restrição histórica).
      { label: "Alunos & Matrículas", icon: "GraduationCap", groupRoles: [...PEDAGOGY, "FINANCIAL"] },
      { label: "Documentos Oficiais", icon: "FileText" },
    ],
  },
  { id: "academico", label: "Académico", icon: "School", audience: "school", sections: [{ label: "Gestão Académica", icon: "School" }] },
  {
    id: "avaliacao", label: "Avaliação", icon: "BookOpenCheck", audience: "school",
    sections: [{ label: "Avaliações & Pautas", icon: "BookOpenCheck" }, { label: "Provas e acompanhamento", loose: true }],
  },
  { id: "vida", label: "Vida Escolar", icon: "Library", audience: "school", sections: [{ label: "Serviços ao aluno" }, { label: "Comunicação", loose: true }] },
  {
    id: "financeiro", label: "Financeiro", icon: "Wallet", audience: "school",
    sections: [{ label: "Propinas & Finanças", icon: "BadgePercent" }, { label: "Subscrição", loose: true }],
  },
  { id: "relatorios", label: "Relatórios", icon: "ChartNoAxesCombined", audience: "school", sections: [{ label: "Relatórios & MED", icon: "ChartBar" }] },
  { id: "configuracoes", label: "Configurações", icon: "Settings", audience: "school", sections: [{}] },
  // Encarregado e aluno: grupos rotulados numa coluna única.
  { id: "acompanhamento", label: "Acompanhamento", icon: "GraduationCap", audience: "family", sections: [{}] },
  { id: "servicos", label: "Serviços", icon: "Briefcase", audience: "family", sections: [{}] },
  { id: "conta", label: "Conta", icon: "UserCog", audience: "family", sections: [{}] },
];

const fam = (name: string, url: string, icon: string, module: "acompanhamento" | "servicos"): PageDef => ({ name, url, icon, module, roles: FAMILY });

// ---- Páginas (a ordem é a da sidebar dentro de cada secção) --------------------------------------------------------
export const PAGES: readonly PageDef[] = [
  // Área da família
  { name: "Início", url: "/dashboard", icon: "House", module: "acompanhamento", roles: FAMILY },
  fam("Aproveitamento", "/familia/aproveitamento", "GraduationCap", "acompanhamento"),
  fam("Horário", "/familia/horario", "CalendarRange", "acompanhamento"),
  fam("Calendário", "/familia/calendario", "CalendarDays", "acompanhamento"),
  fam("Disciplinas", "/familia/disciplinas", "BookOpen", "acompanhamento"),
  fam("Provas Online", "/familia/provas", "FileText", "acompanhamento"),
  fam("Financeiro", "/familia/financeiro", "Wallet", "servicos"),
  fam("Biblioteca", "/familia/biblioteca", "Library", "servicos"),
  fam("Documentos e Pedidos", "/familia/documentos", "Files", "servicos"),
  fam("Comunicados", "/familia/comunicados", "Megaphone", "servicos"),
  { name: "Configurações", url: "/settings", icon: "Settings", module: "conta", roles: FAMILY },

  // Escola
  { name: "Dashboard", url: "/dashboard", icon: "LayoutDashboard", module: "inicio", roles: SCHOOL_ROLES },

  { name: "Candidaturas", url: "/students/admissions", icon: "FileInput", module: "secretaria", section: "Alunos & Matrículas", roles: [...PEDAGOGY, "FINANCIAL"] },
  { name: "Sessões da Prova de Acesso", url: "/admissions/sessions", icon: "ClipboardCheck", module: "secretaria", section: "Alunos & Matrículas", roles: PEDAGOGY_T },
  { name: "Alunos", url: "/students/list", icon: "Users", module: "secretaria", section: "Alunos & Matrículas", roles: [...PEDAGOGY, "FINANCIAL"] },
  { name: "Matrículas", url: "/students/enrollments", icon: "ClipboardList", module: "secretaria", section: "Alunos & Matrículas", roles: PEDAGOGY },
  { name: "Encarregados", url: "/students/guardians", icon: "Contact", module: "secretaria", section: "Alunos & Matrículas", roles: PEDAGOGY },
  { name: "Emolumentos & Documentos", url: "/certificates/documents", icon: "FileText", module: "secretaria", section: "Documentos Oficiais", roles: PEDAGOGY },
  { name: "Boletins de Notas", url: "/certificates/report-cards", icon: "ScrollText", module: "secretaria", section: "Documentos Oficiais", roles: PEDAGOGY },
  { name: "Arquivo Documental", url: "/certificates/archive", icon: "Archive", module: "secretaria", section: "Documentos Oficiais", roles: PEDAGOGY, minPlan: "enterprise", feature: "archive_advanced" },

  { name: "Turmas", url: "/academic/classes", icon: "LayoutGrid", module: "academico", section: "Gestão Académica", roles: PEDAGOGY_T },
  { name: "Disciplinas", url: "/academic/subjects", icon: "BookOpen", module: "academico", section: "Gestão Académica", roles: PEDAGOGY },
  { name: "Professores", url: "/academic/assignments", icon: "UserCog", module: "academico", section: "Gestão Académica", roles: PEDAGOGY },
  { name: "Horários", url: "/academic/timetables", icon: "CalendarRange", module: "academico", section: "Gestão Académica", roles: PEDAGOGY_T },
  { name: "Calendário Escolar", url: "/academic/calendar", icon: "CalendarDays", module: "academico", section: "Gestão Académica", roles: PEDAGOGY_T },
  { name: "Aulas e Sumários", url: "/academic/lessons", icon: "NotebookPen", module: "academico", section: "Gestão Académica", roles: PEDAGOGY_T, minPlan: "profissional", feature: "lessons_summaries", teaser: true },
  { name: "Faltas & Disciplina", url: "/academic/attendance", icon: "UserCheck", module: "academico", section: "Gestão Académica", roles: PEDAGOGY_T },
  { name: "Assiduidade Docente", url: "/teachers-attendance", icon: "QrCode", module: "academico", section: "Gestão Académica", roles: PEDAGOGY_T, minPlan: "profissional", feature: "teacher_attendance" },

  { name: "Lançamento de Notas", url: "/grades/entry", icon: "PenLine", module: "avaliacao", section: "Avaliações & Pautas", roles: PEDAGOGY_T },
  { name: "Pautas Trimestrais", url: "/grades/pautas", icon: "Table", module: "avaliacao", section: "Avaliações & Pautas", roles: [...PEDAGOGY_T, "MED_AUDITOR"] },
  { name: "Reapreciação de Notas", url: "/grades/reviews", icon: "FilePen", module: "avaliacao", section: "Avaliações & Pautas", roles: PEDAGOGY_T },
  { name: "Conselhos de Turma", url: "/grades/councils", icon: "UsersRound", module: "avaliacao", section: "Avaliações & Pautas", roles: PEDAGOGY_T },
  { name: "Exames Finais", url: "/grades/final-exams", icon: "GraduationCap", module: "avaliacao", section: "Avaliações & Pautas", roles: PEDAGOGY_T },
  { name: "Transições de Classe", url: "/grades/transitions", icon: "MoveUpRight", module: "avaliacao", section: "Avaliações & Pautas", roles: [...MGMT, "PEDAGOGIC_DIRECTOR"] },
  { name: "Provas Online", url: "/online-exams", icon: "FileSpreadsheet", module: "avaliacao", section: "Provas e acompanhamento", roles: [...MGMT, "PEDAGOGIC_DIRECTOR", "TEACHER"], minPlan: "profissional", feature: "exams_full", teaser: true },
  { name: "Alerta de Risco", url: "/dropout-risk", icon: "TriangleAlert", module: "avaliacao", section: "Provas e acompanhamento", roles: PEDAGOGY_T, minPlan: "profissional", feature: "risk_alerts", teaser: true },

  { name: "Biblioteca Escolar", url: "/academic/library", icon: "Library", module: "vida", section: "Serviços ao aluno", roles: PEDAGOGY_T },
  { name: "Saúde & Psicopedagogia", url: "/academic/health-psychology", icon: "HeartPulse", module: "vida", section: "Serviços ao aluno", roles: PEDAGOGY_T, minPlan: "profissional", feature: "school_services" },
  { name: "Transporte Escolar", url: "/academic/transport", icon: "Bus", module: "vida", section: "Serviços ao aluno", roles: PEDAGOGY_T, minPlan: "profissional", feature: "school_services" },
  { name: "Atividades Extracurriculares", url: "/academic/extracurricular", icon: "Trophy", module: "vida", section: "Serviços ao aluno", roles: PEDAGOGY_T, minPlan: "profissional", feature: "school_services" },
  { name: "Comunicação & Circulares", url: "/communication/circulars", icon: "Megaphone", module: "vida", section: "Comunicação", roles: PEDAGOGY_T },

  { name: "Visão geral", url: "/tuition", icon: "ChartNoAxesCombined", module: "financeiro", section: "Propinas & Finanças", roles: [...MGMT, "FINANCIAL"] },
  { name: "Comprovativos", url: "/tuition/submissions", icon: "FileCheck", module: "financeiro", section: "Propinas & Finanças", roles: [...MGMT, "FINANCIAL"] },
  { name: "Propinas", url: "/tuition/payments", icon: "Wallet", module: "financeiro", section: "Propinas & Finanças", roles: [...MGMT, "FINANCIAL", "SECRETARY"] },
  { name: "Faturas", url: "/tuition/invoices", icon: "Receipt", module: "financeiro", section: "Propinas & Finanças", roles: [...MGMT, "FINANCIAL", "SECRETARY"] },
  { name: "Cobrança por E-mail", url: "/tuition/collections", icon: "Mail", module: "financeiro", section: "Propinas & Finanças", roles: [...MGMT, "FINANCIAL"], minPlan: "enterprise", feature: "email_collections" },
  { name: "Tabelas de Preço", url: "/tuition/plans", icon: "Tag", module: "financeiro", section: "Propinas & Finanças", roles: ["DIRECTOR_GENERAL", "OWNER", "ADMIN", "FINANCIAL"] },
  { name: "Planos", url: "/plans", icon: "Wallet", module: "financeiro", section: "Subscrição", roles: ["DIRECTOR_GENERAL", "OWNER", "ADMIN"] },

  { name: "Mapas do MED", url: "/reports/med", icon: "Map", module: "relatorios", section: "Relatórios & MED", roles: ["DIRECTOR_GENERAL", "OWNER", "ADMIN", "PEDAGOGIC_DIRECTOR", "MED_AUDITOR"] },
  { name: "Rendimento", url: "/reports/academic", icon: "ChartLine", module: "relatorios", section: "Relatórios & MED", roles: [...PEDAGOGY, "MED_AUDITOR"] },
  { name: "Relatório Financeiro", url: "/reports/finance", icon: "CircleDollarSign", module: "relatorios", section: "Relatórios & MED", roles: ["DIRECTOR_GENERAL", "OWNER", "ADMIN", "FINANCIAL"] },
  { name: "BI & Analytics", url: "/reports/bi", icon: "ChartNoAxesCombined", module: "relatorios", section: "Relatórios & MED", roles: [...MGMT, "PEDAGOGIC_DIRECTOR"], minPlan: "enterprise", feature: "bi_analytics" },
  { name: "Multi-Escola", url: "/reports/multi-school", icon: "Building2", module: "relatorios", section: "Relatórios & MED", roles: ["DIRECTOR_GENERAL", "OWNER", "ADMIN"], minPlan: "enterprise", feature: "multi_school" },

  { name: "Configurações", url: "/settings", icon: "Settings", module: "configuracoes", roles: SCHOOL_ROLES },
];

/**
 * Permissão (da API) que dá acesso de LEITURA a cada página: a sidebar só mostra a página a quem a tem (qualquer uma da lista).
 * Páginas ausentes não dependem de permissão. A lista de papéis em `PAGES` continua a decidir a audiência (escola/família).
 */
export const PAGE_PERMISSION: Readonly<Record<string, readonly string[]>> = {
  "/students/admissions": ["admission:read"], "/admissions/sessions": ["admission:read"], "/students/list": ["student:read"],
  "/students/enrollments": ["enrollment:read"], "/students/guardians": ["guardian:read"],
  "/certificates/documents": ["document:read", "request:read"],
  "/certificates/declarations": ["document:read"], "/certificates/report-cards": ["document:read"], "/certificates/archive": ["document:read"], "/certificates/requests": ["request:read"],
  "/academic/classes": ["section:read"], "/academic/subjects": ["subject:read"], "/academic/assignments": ["teaching:read"],
  "/academic/timetables": ["timetable:read"], "/academic/calendar": ["calendar:read"], "/academic/lessons": ["lesson:read"],
  "/academic/attendance": ["absence:read"], "/teachers-attendance": ["attendance:read", "attendance:self"],
  "/grades/entry": ["assessment:read"], "/grades/pautas": ["pauta:read"], "/grades/reviews": ["grade_review:read"], "/grades/councils": ["council:read"],
  "/grades/final-exams": ["final_exam:read"], "/grades/transitions": ["enrollment:read"], "/online-exams": ["exam:read"], "/dropout-risk": ["risk:read"],
  "/academic/library": ["library:read"], "/academic/health-psychology": ["health:read", "psycho:read"], "/academic/transport": ["transport:read"],
  "/academic/extracurricular": ["activity:read"], "/communication/circulars": ["announcement:read"],
  "/tuition": ["invoice:read"], "/tuition/submissions": ["tuition_submission:read"], "/tuition/payments": ["payment:read"], "/tuition/invoices": ["invoice:read"],
  "/tuition/collections": ["invoice:read"], "/tuition/plans": ["bank_account:read"], "/plans": ["subscription:read"],
  "/reports/med": ["report:med_read"], "/reports/academic": ["report:read"], "/reports/finance": ["report:read"], "/reports/bi": ["report:read"],
};
