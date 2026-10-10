"use client";

import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { announcementsService, type NewAnnouncement } from "@/services/announcements-service";
import { useActiveSchoolStore } from "@/stores/school/active-school-store";

/** Comunicados da escola / turma (API): rascunho → publicado (chega ao portal) → arquivado. */
export function useAnnouncements() {
  const schoolId = useActiveSchoolStore((s) => s.schoolId);
  const queryClient = useQueryClient();
  const key = ["announcements", schoolId];
  const { data = [], isLoading, isError, refetch } = useQuery({ queryKey: key, queryFn: announcementsService.list, enabled: Boolean(schoolId), staleTime: 30 * 1000 });
  const refresh = () => queryClient.invalidateQueries({ queryKey: key });

  const create = useMutation({ mutationFn: (v: NewAnnouncement) => announcementsService.create(v), onSuccess: refresh });
  const update = useMutation({ mutationFn: (v: { id: string; title: string; body: string }) => announcementsService.update(v.id, { title: v.title, body: v.body }), onSuccess: refresh });
  const publish = useMutation({ mutationFn: (id: string) => announcementsService.publish(id), onSuccess: refresh });
  const archive = useMutation({ mutationFn: (id: string) => announcementsService.archive(id), onSuccess: refresh });

  const counts = useMemo(() => ({
    total: data.length,
    published: data.filter((a) => a.status === "publicado").length,
    drafts: data.filter((a) => a.status === "rascunho").length,
    school: data.filter((a) => a.audience === "escola" && a.status === "publicado").length,
  }), [data]);

  return { announcements: data, isLoading, isError, refetch, counts, create, update, publish, archive };
}
