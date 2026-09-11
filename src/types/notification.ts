export interface NotificationResponse {
  data: NotificationType[];
  total: number;
  page: number;
  pageCount: number;
}

export type NotificationCategory =
  | "INFO"
  | "WARNING"
  | "ATENÇÃO"
  | "ERROR"
  | "ERRO"
  | "SUCCESS"
  | "SUCESSO"
  | "AI_ALERT";

export type NotificationType = {
  id: string;
  title: string;
  message: string;
  type: NotificationCategory | string;
  userId: string;
  companyId?: string;
  isRead: boolean;
  isAiAlert?: boolean;
  aiCategory?: "BILLING" | "STOCK" | "POS" | "CLIENTS" | "MARGIN" | string;
  createdAt: string;
};

export interface NotificationParams {
  skip: number;
  take: number;
  type?: string;
  isRead?: boolean;
}

