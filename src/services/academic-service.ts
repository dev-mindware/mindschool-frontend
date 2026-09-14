import api from "./api";
import { AcademicSection, Subject, TeacherAssignment, Shift, EducationCycle, ClassScheduleEntry } from "@/types";

export interface GetSectionsParams {
  search?: string;
  shift?: Shift;
  cycle?: EducationCycle;
  academicYear?: string;
}

export const academicService = {
  // Turmas / Secções
  getSections: async (params?: GetSectionsParams): Promise<AcademicSection[]> => {
    const response = await api.get<AcademicSection[]>("/academic/sections", { params });
    return response.data;
  },

  getSectionById: async (id: string): Promise<AcademicSection> => {
    const response = await api.get<AcademicSection>(`/academic/sections/${id}`);
    return response.data;
  },

  createSection: async (data: Partial<AcademicSection>): Promise<AcademicSection> => {
    const response = await api.post<AcademicSection>("/academic/sections", data);
    return response.data;
  },

  updateSection: async (id: string, data: Partial<AcademicSection>): Promise<AcademicSection> => {
    const response = await api.patch<AcademicSection>(`/academic/sections/${id}`, data);
    return response.data;
  },

  deleteSection: async (id: string): Promise<void> => {
    await api.delete(`/academic/sections/${id}`);
  },

  // Disciplinas
  getSubjects: async (params?: { cycle?: EducationCycle; search?: string }): Promise<Subject[]> => {
    const response = await api.get<Subject[]>("/academic/subjects", { params });
    return response.data;
  },

  createSubject: async (data: Partial<Subject>): Promise<Subject> => {
    const response = await api.post<Subject>("/academic/subjects", data);
    return response.data;
  },

  updateSubject: async (id: string, data: Partial<Subject>): Promise<Subject> => {
    const response = await api.patch<Subject>(`/academic/subjects/${id}`, data);
    return response.data;
  },

  deleteSubject: async (id: string): Promise<void> => {
    await api.delete(`/academic/subjects/${id}`);
  },

  // Atribuição de Professores
  getTeacherAssignments: async (params?: { sectionId?: string; teacherId?: string }): Promise<TeacherAssignment[]> => {
    const response = await api.get<TeacherAssignment[]>("/academic/assignments", { params });
    return response.data;
  },

  assignTeacher: async (data: Partial<TeacherAssignment>): Promise<TeacherAssignment> => {
    const response = await api.post<TeacherAssignment>("/academic/assignments", data);
    return response.data;
  },

  deleteTeacherAssignment: async (id: string): Promise<void> => {
    await api.delete(`/academic/assignments/${id}`);
  },

  // Horários Escolares
  getTimetableSlots: async (params?: { sectionId?: string; teacherId?: string; roomId?: string }): Promise<ClassScheduleEntry[]> => {
    const response = await api.get<ClassScheduleEntry[]>("/academic/timetables", { params });
    return response.data;
  },

  saveTimetableSlot: async (slot: Partial<ClassScheduleEntry>): Promise<ClassScheduleEntry> => {
    const response = await api.post<ClassScheduleEntry>("/academic/timetables/slot", slot);
    return response.data;
  },

  deleteTimetableSlot: async (id: string): Promise<void> => {
    await api.delete(`/academic/timetables/slot/${id}`);
  },
};
