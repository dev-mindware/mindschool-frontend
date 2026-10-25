export interface ChatbotMessageRequest {
  message: string;
  empresa: string;
  userName: string;
  sessionId: string;
  companyId: string;
  userId: string;
  storeId?: string | null;
  /** MindSchool: o produto e a escola ativa (o servidor do assistente usa-os para responder sobre a escola certa). */
  product?: "mindschool";
  schoolId?: string;
  schoolName?: string;
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
