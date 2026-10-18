import type { PlanType } from "@/types";

/** O que cada plano acrescenta (texto do convite ao upgrade). Alinhado com o catálogo da API (`subscriptions/catalog.ts`). */
export const PLAN_BENEFITS: Record<PlanType, readonly string[]> = {
  essencial: [
    "Gestão académica de turmas, matrículas e horários",
    "Pautas trimestrais e lançamento de notas",
    "Cobrança de propinas e emissão de recibos",
    "Dias lectivos e feriados do ano lectivo",
    "Portal do aluno e do encarregado",
  ],
  profissional: [
    "Calendário geral editável, actividades e Google Calendar",
    "Salas, aulas, substituições e sumários",
    "Alerta de risco de abandono e assiduidade docente",
    "Provas online, saúde, transporte e extracurriculares",
  ],
  enterprise: [
    "Tudo o que o Profissional inclui",
    "Cobrança automática por e-mail aos encarregados",
    "Gestão multi-escola",
    "BI & Analytics: tendências por ano lectivo e por mês",
    "Alunos, turmas e professores sem limite",
  ],
};
