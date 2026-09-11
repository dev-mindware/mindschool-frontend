import type {
  OwnerDashboardData,
  ManagerDashboardData,
  DashboardOverview,
  DashboardPeriodType,
} from "@/types";
import type {
  PosManagementDashboard,
  ReportExportParams,
} from "@/types/reports";
import api from "./api";

export interface DashboardOverviewParams {
  period: DashboardPeriodType;
  /** Ausente = âmbito global (OWNER); presente = âmbito de uma loja. */
  storeId?: string;
}

export const reportsService = {
  getDashboardOverview: async (params: DashboardOverviewParams) => {
    return api.get<DashboardOverview>("/reports/dashboard/overview", { params });
  },
  getOwnerDashboard: async () => {
    return api.get<OwnerDashboardData>("/reports/dashboard/global");
  },
  getManagerDashboard: async (storeId: string) => {
    return api.get<ManagerDashboardData>(`/reports/dashboard`, {
      params: { storeId },
    });
  },
  getPosManagementDashboard: async () => {
    return api.get<PosManagementDashboard>("/reports/dashboard/pos-management");
  },
  exportReport: async (params: ReportExportParams) => {
    return api.get<Blob>("/reports/export", {
      params,
      responseType: "blob",
      headers: {
        Accept: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });
  },
};
