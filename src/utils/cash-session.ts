import type { CashSession } from "@/types/cash-session";

export function getExpectedCashSessionEnd(
  session: Pick<CashSession, "openedAt" | "workTime">,
) {
  if (!session.openedAt || !session.workTime) return null;

  const openedAt = new Date(session.openedAt);
  const [hours, minutes] = session.workTime.split(":").map(Number);

  if (
    Number.isNaN(openedAt.getTime()) ||
    !Number.isFinite(hours) ||
    !Number.isFinite(minutes)
  ) {
    return null;
  }

  const expectedEnd = new Date(openedAt);
  expectedEnd.setMinutes(expectedEnd.getMinutes() + hours * 60 + minutes);
  return expectedEnd;
}

export function isDuplicateOpeningRequestError(error: unknown) {
  const response = (error as any)?.response;
  const message = String(response?.data?.message || "").toLowerCase();

  return (
    response?.status === 409 ||
    message.includes("já solicit") ||
    message.includes("pedido pendente") ||
    message.includes("already requested") ||
    message.includes("pending request")
  );
}
