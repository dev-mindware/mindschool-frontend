import api from "./api";
import { fetchAllPages } from "./api-pagination";

export interface ApiActivity {
  id: string;
  academic_year_id: string;
  name: string;
  description: string | null;
  teacher_id: string | null;
  weekday: number | null;
  start_time: string | null;
  end_time: string | null;
  location: string | null;
  capacity: number;
  enrolled: number;
  seats_free: number;
  status: "aberta" | "encerrada";
}

export interface ApiActivityEnrollment { id: string; student_id: string; student_name: string; enrolled_at: string }
export interface ApiActivityDetail extends ApiActivity { enrollments: ApiActivityEnrollment[] }

export interface NewActivity {
  academicYearId: string;
  name: string;
  description?: string;
  teacherId?: string;
  weekday?: number;
  startTime?: string;
  endTime?: string;
  location?: string;
  capacity: number;
}

export const WEEKDAYS = ["", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado", "Domingo"];

export const extracurricularService = {
  list: () => fetchAllPages<ApiActivity>("/s/activities"),
  detail: async (id: string): Promise<ApiActivityDetail> => (await api.get<ApiActivityDetail>(`/s/activities/${id}`)).data,
  create: async (v: NewActivity): Promise<ApiActivity> =>
    (await api.post<ApiActivity>("/s/activities", {
      academic_year_id: v.academicYearId, name: v.name, capacity: v.capacity,
      ...(v.description ? { description: v.description } : {}), ...(v.teacherId ? { teacher_id: v.teacherId } : {}), ...(v.weekday ? { weekday: v.weekday } : {}),
      ...(v.startTime ? { start_time: v.startTime } : {}), ...(v.endTime ? { end_time: v.endTime } : {}), ...(v.location ? { location: v.location } : {}),
    })).data,
  close: async (id: string) => (await api.post<ApiActivity>(`/s/activities/${id}/close`, {})).data,
  enroll: async (activityId: string, studentId: string) => (await api.post(`/s/activities/${activityId}/enrollments`, { student_id: studentId })).data,
  cancelEnrollment: async (activityId: string, enrollmentId: string) => (await api.post(`/s/activities/${activityId}/enrollments/${enrollmentId}/cancel`, {})).data,
};
