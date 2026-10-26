import api from "./api";
import { fetchAllPages } from "./api-pagination";
import { academicService } from "./academic-service";
import type { Enrollment, EnrollmentStatus } from "@/types";

interface ApiEnrollment {
  id: string;
  school_id: string;
  student: { id: string; full_name: string; process_number?: string | null };
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

const toEnrollment = (e: ApiEnrollment, yearName = ""): Enrollment => ({
  id: e.id,
  schoolId: e.school_id,
  enrollmentNumber: e.id.slice(-8).toUpperCase(),
  studentId: e.student.id,
  studentName: e.student.full_name,
  studentNumber: e.student.process_number ?? "",
  academicYearId: e.academic_year_id,
  academicYear: yearName,
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
  list: async (): Promise<Enrollment[]> => {
    const [rows, years] = await Promise.all([fetchAllPages<ApiEnrollment>("/s/enrollments"), academicService.years().catch(() => [])]);
    const names = new Map(years.map((y) => [y.id, y.name]));
    return rows.map((e) => toEnrollment(e, names.get(e.academic_year_id) ?? ""));
  },

  /** Matricula um aluno existente (gera o plano de propinas da escola). */
  enroll: async (studentId: string, sectionId: string): Promise<Enrollment> => {
    const { data } = await api.post<ApiEnrollment>(`/s/students/${studentId}/enrollments`, { section_id: sectionId });
    return toEnrollment(data);
  },

  cancel: async (id: string, reason: string, justified = false): Promise<void> => {
    await api.post(`/s/enrollments/${id}/cancel`, { reason, justified });
  },
};
