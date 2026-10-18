import api from "./api";

export interface ApiYearPoint {
  academic_year: { id: string; name: string; start_date: string; end_date: string };
  provisional: boolean;
  enrolled: number;
  approval_rate: number | null;
  dropout_rate: number | null;
  attendance_rate: number | null;
  invoiced?: string;
  collected?: string;
  collection_rate?: number | null;
  delinquency_rate?: number | null;
}

export interface ApiInsight {
  key: string;
  label: string;
  current: number;
  previous: number;
  delta: number;
  trend: "up" | "down" | "flat";
  /** A variação é boa para a escola? `null` sem variação. */
  favourable: boolean | null;
  current_year: string;
  previous_year: string;
}

export interface ApiTrends {
  currency: string;
  /** Há parte financeira (o papel pode ler pagamentos). */
  finance: boolean;
  years: ApiYearPoint[];
  insights: ApiInsight[];
  attendance_monthly: Array<{ month: string; records: number; rate: number | null }>;
  note: string;
}

export const analyticsService = {
  trends: async (years = 5): Promise<ApiTrends> => (await api.get<ApiTrends>("/s/analytics/trends", { params: { years } })).data,
};
