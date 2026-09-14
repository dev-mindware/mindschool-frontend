import api from "./api";
import {
  Student,
  StudentStatus,
  Enrollment,
  Guardian,
  AdmissionApplication,
  Candidate,
} from "@/types";

export interface GetStudentsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: StudentStatus;
  classLevel?: string;
  sectionId?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

export const studentsService = {
  getStudents: async (params?: GetStudentsParams): Promise<PaginatedResponse<Student>> => {
    const response = await api.get<PaginatedResponse<Student>>("/students", { params });
    return response.data;
  },

  getStudentById: async (id: string): Promise<Student> => {
    const response = await api.get<Student>(`/students/${id}`);
    return response.data;
  },

  createStudent: async (studentData: Partial<Student>): Promise<Student> => {
    const response = await api.post<Student>("/students", studentData);
    return response.data;
  },

  updateStudent: async (id: string, studentData: Partial<Student>): Promise<Student> => {
    const response = await api.patch<Student>(`/students/${id}`, studentData);
    return response.data;
  },

  deleteStudent: async (id: string): Promise<void> => {
    await api.delete(`/students/${id}`);
  },

  // Enrollments
  getEnrollments: async (params?: { page?: number; academicYear?: string }): Promise<PaginatedResponse<Enrollment>> => {
    const response = await api.get<PaginatedResponse<Enrollment>>("/enrollments", { params });
    return response.data;
  },

  createEnrollment: async (data: Partial<Enrollment>): Promise<Enrollment> => {
    const response = await api.post<Enrollment>("/enrollments", data);
    return response.data;
  },

  // Guardians
  getGuardians: async (params?: { search?: string }): Promise<Guardian[]> => {
    const response = await api.get<Guardian[]>("/guardians", { params });
    return response.data;
  },

  createGuardian: async (data: Partial<Guardian>): Promise<Guardian> => {
    const response = await api.post<Guardian>("/guardians", data);
    return response.data;
  },

  // Admissions & Candidates
  getAdmissions: async (params?: { search?: string; status?: string }): Promise<AdmissionApplication[]> => {
    const response = await api.get<AdmissionApplication[]>("/admissions", { params });
    return response.data;
  },

  getCandidates: async (): Promise<Candidate[]> => {
    const response = await api.get<Candidate[]>("/admissions/candidates");
    return response.data;
  },

  updateAdmissionStatus: async (
    id: string,
    status: AdmissionApplication["status"],
    notes?: string
  ): Promise<AdmissionApplication> => {
    const response = await api.patch<AdmissionApplication>(`/admissions/${id}/status`, {
      status,
      notes,
    });
    return response.data;
  },
};
