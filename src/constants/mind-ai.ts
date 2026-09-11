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
