import { useMutation } from "@tanstack/react-query";
import { ChatbotService } from "@/services/chatbot-service";
import { ChatbotMessageRequest, ChatbotResponse } from "@/types";

export const useSendChatMessage = () => {
  return useMutation<ChatbotResponse, Error, ChatbotMessageRequest>({
    mutationFn: (data: ChatbotMessageRequest) =>
      ChatbotService.sendChatMessage(data),
  });
};
