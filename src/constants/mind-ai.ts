export const MIND_WEEKLY_MESSAGE_LIMIT = 10;

export function getCurrentWeekStart(date = new Date()): Date {
  const weekStart = new Date(date);
  const day = weekStart.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;

  weekStart.setDate(weekStart.getDate() + mondayOffset);
  weekStart.setHours(0, 0, 0, 0);

  return weekStart;
}

export function countWeeklyUserMessages(
  sessions: Array<{
    messages: Array<{ role: string; created_at?: string; failed?: boolean }>;
  }>,
): number {
  const weekStart = getCurrentWeekStart().getTime();

  return sessions.reduce((total, session) => {
    return (
      total +
      session.messages.filter(
        (message) =>
          message.role === "user" &&
          !message.failed &&
          Boolean(message.created_at) &&
          new Date(message.created_at as string).getTime() >= weekStart,
      ).length
    );
  }, 0);
}

export const MIND_RETRY_ERROR_MESSAGE =
  "Não foi possível obter resposta (limite de tokens ou erro temporário). Esta mensagem não conta no limite semanal — edite o texto e tente novamente, ou tente mais tarde.";

/** Sugestões do assistente por papel: cada pessoa vê o que lhe interessa na escola. */
const CHIPS_BY_ROLE: Record<string, string[]> = {
  GUARDIAN: ["Propinas", "Notas", "Horário", "Faltas", "Como faço…"],
  STUDENT: ["Notas", "Horário", "Faltas", "Biblioteca", "Como faço…"],
  TEACHER: ["Lançar notas", "Chamada", "Horário", "Pautas", "Como faço…"],
  FINANCIAL: ["Propinas em atraso", "Pagamentos", "Faturas", "Comprovativos", "Como faço…"],
  SECRETARY: ["Matrículas", "Candidaturas", "Requerimentos", "Declarações", "Como faço…"],
  PEDAGOGIC_DIRECTOR: ["Pautas", "Assiduidade", "Risco de abandono", "Horários", "Como faço…"],
};
const DEFAULT_CHIPS = ["Propinas", "Pautas", "Matrículas", "Assiduidade", "Como faço…"];

export const suggestionChipsFor = (role: string | undefined): string[] => CHIPS_BY_ROLE[role ?? ""] ?? DEFAULT_CHIPS;

/** O que o assistente precisa de saber sobre onde está: o produto, a escola ativa e o papel da pessoa nela. */
export function mindSchoolContext(user: { role?: string; company: { id: string; name: string } }): { product: "mindschool"; schoolId: string; schoolName: string; role?: string } {
  return { product: "mindschool", schoolId: user.company.id, schoolName: user.company.name, ...(user.role ? { role: user.role } : {}) };
}
