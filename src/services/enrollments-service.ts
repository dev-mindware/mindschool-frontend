import api from "./api";
import { fetchAllPages } from "./api-pagination";
import type { Enrollment, EnrollmentStatus } from "@/types";

interface ApiEnrollment {
  id: string;
  school_id: string;
  student: { id: string; full_name: string };
  academic_year_id: string;
  section: { id: string; name: string; shift: string };
  class_level: { id: string; name: string; level_number: number };
  status: string;
  enrolled_at: string;
  cancelled_at: string | null;
  cancellation_reason: string | null;
}

const STATUS: Record<string, EnrollmentStatus> = {
  pre_inscrito: "ACTIVE",
  matriculado: "ACTIVE",
  activo: "ACTIVE",
  concluido: "ACTIVE",
  anulado: "CANCELLED",
  transferido: "TRANSFERRED",
};

const toEnrollment = (e: ApiEnrollment): Enrollment => ({
  id: e.id,
  schoolId: e.school_id,
  enrollmentNumber: e.id.slice(-8).toUpperCase(),
  studentId: e.student.id,
  studentName: e.student.full_name,
  studentNumber: "",
  academicYearId: e.academic_year_id,
  academicYear: "",
  sectionId: e.section.id,
  sectionName: `${e.class_level.name} ${e.section.name}`,
  classLevelId: e.class_level.id,
  classLevelName: e.class_level.name,
  shift: e.section.shift,
  enrollmentDate: e.enrolled_at,
  status: STATUS[e.status] ?? "ACTIVE",
  cancellationReason: e.cancellation_reason,
  cancellationDate: e.cancelled_at,
  tuitionPlanId: "",
  tuitionPlanName: "Plano da escola",
  monthlyTuitionPrice: 0,
  createdAt: "",
  updatedAt: "",
});

export const enrollmentsService = {
  list: async (): Promise<Enrollment[]> => (await fetchAllPages<ApiEnrollment>("/s/enrollments")).map(toEnrollment),

  /** Matricula um aluno existente (gera o plano de propinas da escola). */
  enroll: async (studentId: string, sectionId: string): Promise<Enrollment> => {
    const { data } = await api.post<ApiEnrollment>(`/s/students/${studentId}/enrollments`, { section_id: sectionId });
    return toEnrollment(data);
  },

  cancel: async (id: string, reason: string, justified = false): Promise<void> => {
    await api.post(`/s/enrollments/${id}/cancel`, { reason, justified });
  },
};
