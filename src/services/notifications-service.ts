import api from "@/services/api";
import type { NotificationType } from "@/types";

interface ApiNotification {
  id: string;
  kind: string;
  title: string;
  body: string | null;
  link: string | null;
  read: boolean;
  created_at: string;
}

interface Page {
  data: ApiNotification[];
  page: { limit: number; has_more: boolean; next_cursor: string | null };
}

function inferNotificationType(kind: string, title: string): string {
  const lower = `${kind} ${title}`.toLowerCase();
  if (lower.includes("cancelad") || lower.includes("anulad") || lower.includes("recusad") || lower.includes("rejeitad") || lower.includes("atraso")) {
    return "WARNING";
  }
  if (
    lower.includes("sucesso") ||
    lower.includes("validado") ||
    lower.includes("pago") ||
    lower.includes("pagamento") ||
    lower.includes("concluíd") ||
    lower.includes("concluid") ||
    lower.includes("aprovad") ||
    lower.includes("autorizad")
  ) {
    return "SUCCESS";
  }
  if (lower.includes("erro") || lower.includes("falha") || lower.includes("bloqueio")) {
    return "ERROR";
  }
  return "INFO";
}

function enrichNotificationDescription(kind: string, title: string, body: string | null): string {
  if (body && body.trim().length > 25) {
    return body;
  }
  switch (kind) {
    case "enrollment_enrolled":
      return body
        ? `Foi confirmada a matrícula do aluno(a) ${body} no presente ano letivo. O processo encontra-se devidamente averbado nos registos pedagógicos.`
        : "Foi formalizada uma nova matrícula nos registos pedagógicos da instituição de ensino.";
    case "enrollment_cancelled":
      return body
        ? `Informamos que foi efetuado o cancelamento da matrícula do aluno(a) ${body}. Os serviços pedagógicos foram notificados para a devida regularização.`
        : "Informamos que foi efetuado o cancelamento de uma matrícula nos registos da instituição.";
    case "payment_registered":
      return body
        ? `Confirmamos a boa recepção do pagamento no montante de ${body}. A respectiva quitação e a actualização da conta corrente do aluno encontram-se concluídas no sistema.`
        : "Confirmamos o registo e a validação do pagamento no sistema de gestão financeira escolar.";
    case "request_opened":
      return "Acusa-se a recepção do pedido formalizado pelo requerente, encontrando-se o processo em análise nos serviços de secretaria para o devido tratamento.";
    case "request_status":
      return body || "O estado do seu requerimento foi devidamente atualizado no sistema de gestão escolar. Queira consultar os detalhes no portal institucional.";
    case "export_ready":
      return "O processamento do relatório solicitado foi concluído com sucesso pela plataforma. O documento encontra-se pronto para consulta e descarregamento seguro.";
    case "tuition_submission":
      return body
        ? `Comunicação referente ao comprovativo de liquidação: ${body}.`
        : "O comprovativo de pagamento foi submetido e aguarda a devida conferência pelos serviços de tesouraria.";
    case "library":
      return body
        ? `Informação dos serviços de biblioteca escolar: ${body}`
        : "A sua solicitação relativa ao acervo bibliográfico foi registada pelos serviços de biblioteca.";
    case "transport":
      return body
        ? `Informação dos serviços de transporte escolar: ${body}`
        : "Foram actualizadas as informações relativas à rota e aos pontos de recolha do serviço de transporte escolar.";
    case "activity":
      return body
        ? `Detalhes da atividade extracurricular: ${body}`
        : "A inscrição na atividade extracurricular foi devidamente confirmada no sistema escolar.";
    case "announcement":
      return body || "Comunicado institucional da direção escolar emitido para a comunidade académica.";
    default:
      return body || "Notificação oficial emitida pelo sistema de gestão escolar MindSchool.";
  }
}

const toNotification = (n: ApiNotification): NotificationType => ({
  id: n.id,
  title: n.title,
  message: enrichNotificationDescription(n.kind, n.title, n.body),
  type: inferNotificationType(n.kind, n.title),
  userId: "",
  isRead: n.read,
  createdAt: n.created_at,
});

export const notificationsService = {
  /** Feed in-app do utilizador na escola ativa (`GET /schools/:id/notifications`), paginado por cursor. */
  page: async (params: { cursor?: string | null; unread?: boolean; limit?: number }): Promise<{ data: NotificationType[]; nextCursor: string | null }> => {
    const { data } = await api.get<Page>("/s/notifications", {
      params: { limit: params.limit ?? 20, ...(params.cursor ? { cursor: params.cursor } : {}), ...(params.unread ? { unread: "true" } : {}) },
    });
    return { data: data.data.map(toNotification), nextCursor: data.page.has_more ? data.page.next_cursor : null };
  },
  unreadCount: async (): Promise<number> => (await api.get<{ unread: number }>("/s/notifications/unread-count")).data.unread,
  markAsRead: async (id: string) => {
    await api.post(`/s/notifications/${id}/read`, {});
  },
  markAllAsRead: async () => {
    await api.post("/s/notifications/read-all", {});
  },
};
