import { api } from "./api";
import {
  AuditTrailResponse,
  PaginatedAuditTrailResponse,
  AuditTrailFilters,
} from "@/types";

export const auditTrailService = {
  getAuditTrails: async (params?: AuditTrailFilters) => {
    return api.get<PaginatedAuditTrailResponse>("/audit-trails", { params });
  },
  getAuditTrailById: async (id: string) => {
    return api.get<AuditTrailResponse>(`/audit-trails/${id}`);
  },
  getEntityAuditHistory: async (entity: string, entityId: string) => {
    return api.get<AuditTrailResponse[]>(`/audit-trails/entity/${entity}/${entityId}`);
  },
};
