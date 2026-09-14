import api from "./api";
import {
  StudentAttendanceRecord,
  AbsenceJustification,
  TeacherAttendanceLog,
  TeacherAttendanceMetrics,
} from "@/types";

export const attendanceService = {
  // Presenças & Faltas de Alunos
  getStudentAttendance: async (params: {
    classId: string;
    date: string;
    subjectId?: string;
    slotNumber?: number;
  }): Promise<StudentAttendanceRecord[]> => {
    const response = await api.get<StudentAttendanceRecord[]>("/attendance/students", { params });
    return response.data;
  },

  saveStudentAttendance: async (
    records: Partial<StudentAttendanceRecord>[]
  ): Promise<StudentAttendanceRecord[]> => {
    const response = await api.post<StudentAttendanceRecord[]>("/attendance/students", { records });
    return response.data;
  },

  // Justificações de Faltas
  getAbsenceJustifications: async (params?: {
    studentId?: string;
    status?: string;
  }): Promise<AbsenceJustification[]> => {
    const response = await api.get<AbsenceJustification[]>("/attendance/students/justifications", {
      params,
    });
    return response.data;
  },

  submitAbsenceJustification: async (
    data: Partial<AbsenceJustification>
  ): Promise<AbsenceJustification> => {
    const response = await api.post<AbsenceJustification>("/attendance/students/justifications", data);
    return response.data;
  },

  reviewAbsenceJustification: async (
    id: string,
    data: { status: "APPROVED" | "REJECTED"; reviewNotes?: string }
  ): Promise<AbsenceJustification> => {
    const response = await api.patch<AbsenceJustification>(
      `/attendance/students/justifications/${id}`,
      data
    );
    return response.data;
  },

  // Assiduidade Docente via QR Code
  getTeacherAttendanceLogs: async (date?: string): Promise<TeacherAttendanceLog[]> => {
    const response = await api.get<TeacherAttendanceLog[]>("/attendance/teachers", {
      params: { date },
    });
    return response.data;
  },

  getTeacherAttendanceMetrics: async (date?: string): Promise<TeacherAttendanceMetrics> => {
    const response = await api.get<TeacherAttendanceMetrics>("/attendance/teachers/metrics", {
      params: { date },
    });
    return response.data;
  },

  recordTeacherCheckInOut: async (payload: {
    teacherId: string;
    method: "QR_DYNAMIC_APP" | "QR_STATIC_CARD" | "MANUAL_SUPERVISOR";
    terminalId?: string;
  }): Promise<TeacherAttendanceLog> => {
    const response = await api.post<TeacherAttendanceLog>("/attendance/teachers/scan", payload);
    return response.data;
  },
};
