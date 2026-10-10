"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/services/api";
import { fetchAllPages } from "@/services/api-pagination";
import { useActiveSchoolStore } from "@/stores/school/active-school-store";

export type MedMapType = "matriculas" | "aproveitamento";
export type MedStatus = "gerado" | "validado" | "aprovado" | "exportado" | "submetido";

export interface MedSnapshot {
  id: string;
  academic_year_id: string;
  term_id: string | null;
  map_type: MedMapType;
  version: number;
  status: MedStatus;
  checksum: string;
  issues: Array<{ severity: "blocking" | "warning"; code: string; message: string }>;
  created_at: string;
  approved_at: string | null;
  exported_at: string | null;
  submitted_at: string | null;
  submission_reference: string | null;
}

/** Mapas estatisticos do MED (snapshot -> validacao -> aprovacao -> exportacao -> submissao). */
export function useMedSnapshots() {
  const schoolId = useActiveSchoolStore((s) => s.schoolId);
  const queryClient = useQueryClient();
  const key = ["med-snapshots", schoolId];

  const { data: snapshots = [], isLoading } = useQuery({
    queryKey: key,
    queryFn: () => fetchAllPages<MedSnapshot>("/s/med/snapshots"),
    enabled: Boolean(schoolId),
    staleTime: 30 * 1000,
  });
  const refresh = () => queryClient.invalidateQueries({ queryKey: key });

  const create = useMutation({ mutationFn: (v: { academic_year_id: string; term_id?: string; map_type: MedMapType }) => api.post("/s/med/snapshots", v), onSuccess: refresh });
  const validate = useMutation({ mutationFn: (id: string) => api.post(`/s/med/snapshots/${id}/validate`, {}), onSuccess: refresh });
  const approve = useMutation({ mutationFn: (id: string) => api.post(`/s/med/snapshots/${id}/approve`, {}), onSuccess: refresh });
  const submit = useMutation({ mutationFn: (v: { id: string; reference: string }) => api.post(`/s/med/snapshots/${v.id}/submission`, { reference: v.reference }), onSuccess: refresh });
  const exportFile = useMutation({
    mutationFn: async (v: { id: string; format: "csv" | "xlsx" }) => {
      const res = await api.get<Blob>(`/s/med/snapshots/${v.id}/export`, { params: { format: v.format }, responseType: "blob" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(res.data);
      a.download = `mapa-med-${v.id.slice(-6)}.${v.format}`;
      a.click();
      URL.revokeObjectURL(a.href);
    },
    onSuccess: refresh,
  });

  return { snapshots, isLoading, create, validate, approve, submit, exportFile };
}
