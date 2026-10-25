import { ChatbotMessageRequest, ChatbotResponse } from "@/types";
import api from "./api";

const getChatbotUrl = (): string => {
  const raw = process.env.NEXT_PUBLIC_CHATBOT_API_URL || "https://chatbot.mindware-vps.cloud/chat";
  const clean = raw.trim().replace(/\/+$/, "");
  return clean.endsWith("/chat") ? clean : `${clean}/chat`;
};

export const ChatbotService = {
  sendChatMessage: async (
    data: ChatbotMessageRequest,
  ): Promise<ChatbotResponse> => {
    const url = getChatbotUrl();

    try {
      const response = await api.post<ChatbotResponse>(url, data);
      return response.data;
    } catch (err: any) {
      // 401/403 não é «limite de tokens»: o servidor do assistente recusou a sessão (configuração do serviço), e dizê-lo evita tentativas inúteis
      const status = err?.response?.status;
      if (status === 401 || status === 403) {
        throw new Error("O assistente MIND recusou o seu acesso (erro de autorização). Contacte o suporte se continuar.");
      }
      const detail =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        "Failed to send message to Chatbot";
      throw new Error(
        typeof detail === "string" ? detail : JSON.stringify(detail)
      );
    }
  },
};
