"use client";

import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { transportService } from "@/services/transport-service";
import { studentsService } from "@/services/students-service";
import { useActiveSchoolStore } from "@/stores/school/active-school-store";

/** Transporte escolar da escola ativa: rotas com paragens, lotacao e alunos alocados. */
export function useTransport() {
  const schoolId = useActiveSchoolStore((s) => s.schoolId);
  const queryClient = useQueryClient();
  const { data: routes = [], isLoading } = useQuery({ queryKey: ["transport-routes", schoolId], queryFn: transportService.routes, enabled: Boolean(schoolId), staleTime: 15 * 1000 });
  const { data: assignments = [] } = useQuery({ queryKey: ["transport-assignments", schoolId], queryFn: transportService.assignments, enabled: Boolean(schoolId), staleTime: 15 * 1000 });
  const { data: students = [] } = useQuery({ queryKey: ["students", schoolId], queryFn: () => studentsService.list(), enabled: Boolean(schoolId), staleTime: 60 * 1000 });
  const nameOf = useMemo(() => new Map(students.map((s) => [s.id, s.fullName])), [students]);

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["transport-routes", schoolId] });
    queryClient.invalidateQueries({ queryKey: ["transport-assignments", schoolId] });
  };
  const createRoute = useMutation({ mutationFn: transportService.createRoute, onSuccess: refresh });
  const addStop = useMutation({ mutationFn: (v: { routeId: string; name: string; pickupTime?: string }) => transportService.addStop(v.routeId, v.name, v.pickupTime), onSuccess: refresh });
  const setActive = useMutation({ mutationFn: (v: { id: string; isActive: boolean }) => transportService.setActive(v.id, v.isActive), onSuccess: refresh });
  const assign = useMutation({ mutationFn: transportService.assign, onSuccess: refresh });
  const endAssignment = useMutation({ mutationFn: transportService.endAssignment, onSuccess: refresh });

  const metrics = {
    activeRoutes: routes.filter((r) => r.is_active).length,
    students: assignments.length,
    seats: routes.filter((r) => r.is_active).reduce((a, r) => a + r.capacity, 0),
    free: routes.filter((r) => r.is_active).reduce((a, r) => a + r.seats_free, 0),
  };

  return { routes, assignments, students, nameOf, metrics, isLoading, createRoute, addStop, setActive, assign, endAssignment };
}
