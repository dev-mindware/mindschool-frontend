import api from "./api";
import {
  TuitionPlan,
  StudentTuitionFee,
  TuitionPaymentInput,
  TuitionFinancialSummary,
} from "@/types/tuition";

export const tuitionService = {
  // Planos e Tabelas de Preço
  getTuitionPlans: async (academicYear?: string): Promise<TuitionPlan[]> => {
    const response = await api.get<TuitionPlan[]>("/tuition/plans", {
      params: { academicYear },
    });
    return response.data;
  },

  createTuitionPlan: async (data: Partial<TuitionPlan>): Promise<TuitionPlan> => {
    const response = await api.post<TuitionPlan>("/tuition/plans", data);
    return response.data;
  },

  updateTuitionPlan: async (id: string, data: Partial<TuitionPlan>): Promise<TuitionPlan> => {
    const response = await api.patch<TuitionPlan>(`/tuition/plans/${id}`, data);
    return response.data;
  },

  // Propinas por Aluno
  getStudentTuitionFees: async (
    studentId: string,
    academicYear?: string
  ): Promise<StudentTuitionFee[]> => {
    const response = await api.get<StudentTuitionFee[]>(`/tuition/students/${studentId}/fees`, {
      params: { academicYear },
    });
    return response.data;
  },

  // Pagamentos de Propinas
  processPayment: async (paymentInput: TuitionPaymentInput): Promise<{
    success: boolean;
    receiptId: string;
    receiptNumber: string;
    paidFees: StudentTuitionFee[];
  }> => {
    const response = await api.post("/tuition/payments", paymentInput);
    return response.data;
  },

  // Cobranças WhatsApp
  sendWhatsAppReminder: async (feeId: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.post<{ success: boolean; message: string }>(
      `/tuition/collections/whatsapp/${feeId}`
    );
    return response.data;
  },

  // Resumo Financeiro
  getFinancialSummary: async (academicYear?: string): Promise<TuitionFinancialSummary> => {
    const response = await api.get<TuitionFinancialSummary>("/tuition/summary", {
      params: { academicYear },
    });
    return response.data;
  },
};
