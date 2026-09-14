import api from "./api";
import { MedStatisticalReport, MedMetrics, MedSnapshotCut } from "@/types";

export const reportsMedService = {
  // Mapas Estatísticos Oficiais do MED
  getMedStatisticalReports: async (params?: {
    academicYear?: string;
    cut?: MedSnapshotCut;
  }): Promise<MedStatisticalReport[]> => {
    const response = await api.get<MedStatisticalReport[]>("/reports/med", { params });
    return response.data;
  },

  getMedReportById: async (id: string): Promise<MedStatisticalReport> => {
    const response = await api.get<MedStatisticalReport>(`/reports/med/${id}`);
    return response.data;
  },

  generateMedSnapshot: async (cut: MedSnapshotCut): Promise<MedStatisticalReport> => {
    const response = await api.post<MedStatisticalReport>("/reports/med/generate", { cut });
    return response.data;
  },

  submitMedReport: async (
    id: string,
    protocolNumber: string
  ): Promise<MedStatisticalReport> => {
    const response = await api.post<MedStatisticalReport>(`/reports/med/${id}/submit`, {
      protocolNumber,
    });
    return response.data;
  },

  getMedMetrics: async (): Promise<MedMetrics> => {
    const response = await api.get<MedMetrics>("/reports/med/metrics");
    return response.data;
  },
};
