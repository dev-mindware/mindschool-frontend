"use client";

import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/services/api";
import { patchSettings } from "@/services/school-settings-service";
import { academicService } from "@/services/academic-service";
import { useActiveSchoolStore } from "@/stores/school/active-school-store";
import { useSchoolSettingsStore } from "@/stores/school/school-settings-store";
import type { SchoolInstitutionalProfile } from "@/types/school-settings";

interface ApiSchool {
  id: string;
  name: string;
  nif: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  med_code: string | null;
  settings: { branding?: { director_name?: string | null; director_title?: string; logo_url?: string | null; primary_color?: string | null; document_identity?: "estado" | "escola" } };
}

/**
 * Perfil institucional da escola ativa (API `GET /schools/:id`). Hidrata o store usado pelas folhas impressas
 * (circulares, horarios...) para que mostrem os dados reais da escola, e permite gravar as alteracoes.
 */
export function useSchoolProfile() {
  const schoolId = useActiveSchoolStore((s) => s.schoolId);
  // Encarregado e aluno não têm acesso ao perfil da escola (403): só os papéis internos o pedem.
  const familyOnly = useActiveSchoolStore((s) => {
    const roles = s.memberships.find((m) => m.schoolId === s.schoolId)?.roles ?? [];
    return roles.length > 0 && roles.every((r) => ["encarregado", "aluno"].includes(r));
  });
  const queryClient = useQueryClient();
  const updateProfile = useSchoolSettingsStore((s) => s.updateProfile);

  const { data: school } = useQuery({
    queryKey: ["school", schoolId],
    queryFn: async () => (await api.get<ApiSchool>("/s")).data,
    enabled: Boolean(schoolId) && !familyOnly,
    staleTime: 5 * 60 * 1000,
  });

  const updateCalendar = useSchoolSettingsStore((s) => s.updateCalendar);
  const { data: year } = useQuery({
    queryKey: ["active-year", schoolId],
    queryFn: academicService.activeYear,
    enabled: Boolean(schoolId) && !familyOnly,
    staleTime: 5 * 60 * 1000,
  });
  // as folhas impressas mostram o ano letivo ativo da escola (nunca um ano fixo)
  useEffect(() => {
    updateCalendar({ academicYear: year?.name ?? "", yearStartDate: year?.start_date ?? "", yearEndDate: year?.end_date ?? "" });
  }, [year, updateCalendar]);

  useEffect(() => {
    if (!school) return;
    updateProfile({
      id: school.id,
      schoolName: school.name,
      taxNumber: school.nif,
      phone: school.phone ?? "",
      email: school.email ?? "",
      fullAddress: school.address ?? "",
      medRegistrationCode: school.med_code ?? "",
      directorGeneralName: school.settings?.branding?.director_name ?? "",
    });
  }, [school, updateProfile]);

  const save = useMutation({
    mutationFn: (p: Partial<SchoolInstitutionalProfile>) =>
      patchSettings(
        p.directorGeneralName ? { branding: { director_name: p.directorGeneralName } } : {},
        {
          name: p.schoolName,
          ...(p.taxNumber ? { nif: p.taxNumber.trim().toUpperCase() } : {}),
          phone: p.phone ? (p.phone.startsWith("+") ? p.phone : `+244${p.phone.replace(/\s+/g, "")}`) : null,
          email: p.email || null,
          address: p.fullAddress || null,
          med_code: p.medRegistrationCode || null,
        },
      ),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["school", schoolId] }),
  });

  return { school, save };
}
