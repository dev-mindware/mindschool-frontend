import type { PlanType } from "@/types";

/** O que cada plano acrescenta (texto do convite ao upgrade). Alinhado com o catálogo da API (`subscriptions/catalog.ts`). */
export const PLAN_BENEFITS: Record<PlanType, readonly string[]> = {
  essencial: [
    "Gestão académica de turmas, matrículas e horários",
    "Pautas trimestrais e lançamento de notas",
    "Cobrança de propinas e emissão de recibos",
    "Dias letivos e feriados do ano letivo",
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
    "BI & Analytics: tendências por ano letivo e por mês",
    "Arquivo documental: pesquisa, retenção e pacotes de descarga",
    "Gerador automático de horários sem conflitos",
    "Alunos, turmas e professores sem limite",
  ],
};
