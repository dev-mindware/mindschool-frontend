import api from "./api";
import {
  ClassSubjectGradeSheet,
  ConsolidatedPauta,
  PautaAuditEntry,
  StudentReportCard,
  AssessmentTerm,
} from "@/types";

export interface SaveGradePayload {
  sheetId: string;
  studentId: string;
  field: "continuousAssessment" | "teacherTest" | "termExam";
  value: number | undefined;
}

export const gradesService = {
  // Mini-Pautas por disciplina
  getSubjectGradeSheet: async (
    sectionId: string,
    subjectId: string,
    term: AssessmentTerm
  ): Promise<ClassSubjectGradeSheet> => {
    const response = await api.get<ClassSubjectGradeSheet>("/grades/sheets", {
      params: { sectionId, subjectId, term },
    });
    return response.data;
  },

  saveGrade: async (payload: SaveGradePayload): Promise<void> => {
    await api.post("/grades/entry", payload);
  },

  lockGradeSheet: async (sheetId: string): Promise<ClassSubjectGradeSheet> => {
    const response = await api.post<ClassSubjectGradeSheet>(`/grades/sheets/${sheetId}/lock`);
    return response.data;
  },

  // Pautas Consolidadas Trimestrais
  getConsolidatedPautas: async (params?: {
    academicYear?: string;
    term?: AssessmentTerm;
    sectionId?: string;
  }): Promise<ConsolidatedPauta[]> => {
    const response = await api.get<ConsolidatedPauta[]>("/grades/pautas", { params });
    return response.data;
  },

  getConsolidatedPautaById: async (pautaId: string): Promise<ConsolidatedPauta> => {
    const response = await api.get<ConsolidatedPauta>(`/grades/pautas/${pautaId}`);
    return response.data;
  },

  lockPauta: async (
    pautaId: string,
    data: { directorName: string }
  ): Promise<ConsolidatedPauta> => {
    const response = await api.post<ConsolidatedPauta>(`/grades/pautas/${pautaId}/lock`, data);
    return response.data;
  },

  reopenPauta: async (
    pautaId: string,
    data: { reason: string; directorName: string }
  ): Promise<ConsolidatedPauta> => {
    const response = await api.post<ConsolidatedPauta>(`/grades/pautas/${pautaId}/reopen`, data);
    return response.data;
  },

  // Auditoria Pedagógica
  getAuditLogs: async (academicYear?: string): Promise<PautaAuditEntry[]> => {
    const response = await api.get<PautaAuditEntry[]>("/grades/pautas/audit-logs", {
      params: { academicYear },
    });
    return response.data;
  },

  // Boletim Oficial de Notas
  getStudentReportCard: async (
    studentId: string,
    academicYear?: string
  ): Promise<StudentReportCard> => {
    const response = await api.get<StudentReportCard>(`/grades/report-card/${studentId}`, {
      params: { academicYear },
    });
    return response.data;
  },
};
