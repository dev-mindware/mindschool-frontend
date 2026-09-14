import api from "./api";
import { OnlineExam, StudentExamSubmission } from "@/types";

export const onlineExamsService = {
  getExams: async (params?: { classId?: string; subjectId?: string }): Promise<OnlineExam[]> => {
    const response = await api.get<OnlineExam[]>("/online-exams", { params });
    return response.data;
  },

  getExamById: async (id: string): Promise<OnlineExam> => {
    const response = await api.get<OnlineExam>(`/online-exams/${id}`);
    return response.data;
  },

  createExam: async (data: Partial<OnlineExam>): Promise<OnlineExam> => {
    const response = await api.post<OnlineExam>("/online-exams", data);
    return response.data;
  },

  updateExamStatus: async (
    id: string,
    status: OnlineExam["status"]
  ): Promise<OnlineExam> => {
    const response = await api.patch<OnlineExam>(`/online-exams/${id}/status`, { status });
    return response.data;
  },

  getSubmissions: async (examId: string): Promise<StudentExamSubmission[]> => {
    const response = await api.get<StudentExamSubmission[]>(`/online-exams/${examId}/submissions`);
    return response.data;
  },

  gradeSubmission: async (
    submissionId: string,
    data: { score: number; feedback?: string }
  ): Promise<StudentExamSubmission> => {
    const response = await api.patch<StudentExamSubmission>(
      `/online-exams/submissions/${submissionId}/grade`,
      data
    );
    return response.data;
  },
};
