import api from "./api";
import { DropoutRiskAlert, DropoutActionLog } from "@/types";

export const dropoutRiskService = {
  getAlerts: async (params?: { riskLevel?: string; status?: string }): Promise<DropoutRiskAlert[]> => {
    const response = await api.get<DropoutRiskAlert[]>("/dropout-risk/alerts", { params });
    return response.data;
  },

  getAlertById: async (id: string): Promise<DropoutRiskAlert> => {
    const response = await api.get<DropoutRiskAlert>(`/dropout-risk/alerts/${id}`);
    return response.data;
  },

  recordAction: async (
    alertId: string,
    action: Partial<DropoutActionLog>
  ): Promise<DropoutRiskAlert> => {
    const response = await api.post<DropoutRiskAlert>(
      `/dropout-risk/alerts/${alertId}/actions`,
      action
    );
    return response.data;
  },

  updateAlertStatus: async (
    alertId: string,
    status: DropoutRiskAlert["status"]
  ): Promise<DropoutRiskAlert> => {
    const response = await api.patch<DropoutRiskAlert>(`/dropout-risk/alerts/${alertId}/status`, {
      status,
    });
    return response.data;
  },
};
