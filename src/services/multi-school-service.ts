import api from "./api";
import { SchoolUnitSummary, MultiSchoolMetrics } from "@/types";

export const multiSchoolService = {
  getUnits: async (): Promise<SchoolUnitSummary[]> => {
    const response = await api.get<SchoolUnitSummary[]>("/multi-school/units");
    return response.data;
  },

  getMetrics: async (): Promise<MultiSchoolMetrics> => {
    const response = await api.get<MultiSchoolMetrics>("/multi-school/metrics");
    return response.data;
  },

  createUnit: async (data: Partial<SchoolUnitSummary>): Promise<SchoolUnitSummary> => {
    const response = await api.post<SchoolUnitSummary>("/multi-school/units", data);
    return response.data;
  },
};
