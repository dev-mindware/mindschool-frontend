import api from "./api";
import {
  StudentHealthProfile,
  ClinicVisitRecord,
  PsychopedagogicalPlan,
  PsychologySessionNote,
} from "@/types";

export const healthService = {
  // Ficha Médica do Aluno
  getHealthProfile: async (studentId: string): Promise<StudentHealthProfile> => {
    const response = await api.get<StudentHealthProfile>(`/health/profiles/${studentId}`);
    return response.data;
  },

  updateHealthProfile: async (
    studentId: string,
    data: Partial<StudentHealthProfile>
  ): Promise<StudentHealthProfile> => {
    const response = await api.patch<StudentHealthProfile>(
      `/health/profiles/${studentId}`,
      data
    );
    return response.data;
  },

  // Atendimentos na Enfermaria
  getClinicVisits: async (params?: { date?: string; studentId?: string }): Promise<ClinicVisitRecord[]> => {
    const response = await api.get<ClinicVisitRecord[]>("/health/visits", { params });
    return response.data;
  },

  recordClinicVisit: async (
    data: Partial<ClinicVisitRecord>
  ): Promise<ClinicVisitRecord> => {
    const response = await api.post<ClinicVisitRecord>("/health/visits", data);
    return response.data;
  },

  updateVisitStatus: async (
    visitId: string,
    status: ClinicVisitRecord["status"],
    notes?: string
  ): Promise<ClinicVisitRecord> => {
    const response = await api.patch<ClinicVisitRecord>(`/health/visits/${visitId}/status`, {
      status,
      notes,
    });
    return response.data;
  },

  // Planos Psicopedagógicos & AEE (Inclusão Escolar)
  getPsychopedagogicalPlans: async (params?: {
    studentId?: string;
    needType?: string;
  }): Promise<PsychopedagogicalPlan[]> => {
    const response = await api.get<PsychopedagogicalPlan[]>("/health/aee-plans", { params });
    return response.data;
  },

  createPsychopedagogicalPlan: async (
    data: Partial<PsychopedagogicalPlan>
  ): Promise<PsychopedagogicalPlan> => {
    const response = await api.post<PsychopedagogicalPlan>("/health/aee-plans", data);
    return response.data;
  },

  recordAeeSession: async (
    planId: string,
    session: Partial<PsychologySessionNote>
  ): Promise<PsychologySessionNote> => {
    const response = await api.post<PsychologySessionNote>(
      `/health/aee-plans/${planId}/sessions`,
      session
    );
    return response.data;
  },
};
