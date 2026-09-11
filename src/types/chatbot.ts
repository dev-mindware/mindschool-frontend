export interface ChatbotMessageRequest {
  message: string;
  empresa: string;
  userName: string;
  sessionId: string;
  companyId: string;
  userId: string;
  storeId?: string | null;
  role?: string;
  /** Prior turns in this session (without the current message). */
  history?: Array<{ role: "user" | "assistant"; content: string }>;
}

export interface ChatbotResponse {
  success: boolean;
  reply: string;
  sessionId: string;
}

export interface ChatHistoryItem {
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export interface ChatbotHistoryResponse {
  success: boolean;
  sessionId: string;
  total_messages: number;
  history: ChatHistoryItem[];
}
