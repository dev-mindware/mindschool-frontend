"use client";

import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { academicService } from "@/services/academic-service";
import { extracurricularService, type ApiActivityDetail, type NewActivity } from "@/services/extracurricular-service";
import { studentsService } from "@/services/students-service";
import { useActiveSchoolStore } from "@/stores/school/active-school-store";

/** Atividades extracurriculares da escola ativa, com as inscricoes de cada uma. */
export function useExtracurricular() {
  const schoolId = useActiveSchoolStore((s) => s.schoolId);
  const queryClient = useQueryClient();

  const { data: activities = [], isLoading } = useQuery({ queryKey: ["activities", schoolId], queryFn: extracurricularService.list, enabled: Boolean(schoolId), staleTime: 15 * 1000 });
  // Detalhe (inscritos) de todas as atividades: sao poucas por escola e a lista de inscricoes e uma vista transversal.
  const { data: details = [] } = useQuery({
    queryKey: ["activity-details", schoolId, activities.map((a) => `${a.id}:${a.enrolled}`).join(",")],
    queryFn: () => Promise.all(activities.map((a) => extracurricularService.detail(a.id))),
    enabled: Boolean(schoolId) && activities.length > 0,
    staleTime: 15 * 1000,
  });
  const { data: students = [] } = useQuery({ queryKey: ["students", schoolId], queryFn: () => studentsService.list(), enabled: Boolean(schoolId), staleTime: 60 * 1000 });
  const { data: teachers = [] } = useQuery({ queryKey: ["teachers", schoolId], queryFn: academicService.teachers, enabled: Boolean(schoolId), staleTime: 60 * 1000 });
  const { data: year } = useQuery({ queryKey: ["active-year", schoolId], queryFn: academicService.activeYear, enabled: Boolean(schoolId), staleTime: 5 * 60 * 1000 });

  const teacherName = useMemo(() => new Map(teachers.map((t) => [t.id, t.full_name])), [teachers]);
  const enrollments = useMemo(
    () => (details as ApiActivityDetail[]).flatMap((d) => d.enrollments.map((e) => ({ ...e, activityId: d.id, activityName: d.name }))),
    [details],
  );

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["activities", schoolId] });
    queryClient.invalidateQueries({ queryKey: ["activity-details", schoolId] });
  };
  const create = useMutation({ mutationFn: (v: Omit<NewActivity, "academicYearId">) => extracurricularService.create({ ...v, academicYearId: year!.id }), onSuccess: refresh });
  const close = useMutation({ mutationFn: extracurricularService.close, onSuccess: refresh });
  const enroll = useMutation({ mutationFn: (v: { activityId: string; studentId: string }) => extracurricularService.enroll(v.activityId, v.studentId), onSuccess: refresh });
  const cancelEnrollment = useMutation({ mutationFn: (v: { activityId: string; enrollmentId: string }) => extracurricularService.cancelEnrollment(v.activityId, v.enrollmentId), onSuccess: refresh });

  return {
    activities, enrollments, students, teachers, teacherName, hasActiveYear: Boolean(year), isLoading, create, close, enroll, cancelEnrollment,
    metrics: {
      open: activities.filter((a) => a.status === "aberta").length,
      enrolled: activities.reduce((a, x) => a + x.enrolled, 0),
      capacity: activities.filter((a) => a.status === "aberta").reduce((a, x) => a + x.capacity, 0),
      free: activities.filter((a) => a.status === "aberta").reduce((a, x) => a + x.seats_free, 0),
    },
  };
}
