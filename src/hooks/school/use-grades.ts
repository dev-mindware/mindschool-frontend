"use client";

import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { currentTerm } from "@/lib/current-term";
import { enqueue, isNetworkError } from "@/lib/offline-queue";
import { GradeField, GradeSheetResult, GradeState, gradeItem, gradesService } from "@/services/grades-service";
import { useActiveSchoolStore } from "@/stores/school/active-school-store";
import { AssessmentTerm } from "@/types/grade";

/** Mostra na folha a nota que ficou na fila (as médias só se recalculam quando a nota chegar ao servidor). */
function showQueuedGrade(cur: GradeSheetResult, v: { enrollmentId: string; field: GradeField; value?: number; status?: GradeState }): GradeSheetResult {
  return {
    ...cur,
    sheet: {
      ...cur.sheet,
      entries: cur.sheet.entries.map((e) =>
        e.id === v.enrollmentId ? { ...e, [v.field]: v.status && v.status !== "avaliado" ? undefined : v.value, statuses: { ...e.statuses, [v.field]: v.status ?? "avaliado" } } : e,
      ),
    },
  };
}

/** Mini-pauta (disciplina x turma x trimestre) da escola ativa, com lancamento de notas pela API. */
export function useGradeSheet(sectionId?: string, subjectId?: string, term?: AssessmentTerm) {
  const schoolId = useActiveSchoolStore((s) => s.schoolId);
  const queryClient = useQueryClient();
  const key = ["grade-sheet", schoolId, sectionId, subjectId, term];

  const query = useQuery({
    queryKey: key,
    queryFn: () => gradesService.sheet(sectionId!, subjectId!, term!),
    enabled: Boolean(schoolId && sectionId && subjectId && term),
    staleTime: 15 * 1000,
  });

  const saveGrade = useMutation({
    // Corre mesmo sem rede (por defeito o react-query pausa-a): é assim que a nota cai na fila do dispositivo.
    networkMode: "always",
    mutationFn: async (v: { enrollmentId: string; field: GradeField; value?: number; status?: GradeState }): Promise<"sent" | "queued"> => {
      const assessmentId = query.data?.assessmentIds[v.field];
      try {
        await gradesService.saveGrade({ sectionId: sectionId!, subjectId: subjectId!, term: term!, ...v, assessmentId });
        return "sent";
      } catch (err) {
        // Sem ligação e com a avaliação já criada: a nota guarda-se no dispositivo e segue quando a rede voltar.
        if (!isNetworkError(err) || !assessmentId || !schoolId) throw err;
        enqueue({ kind: "grade", schoolId, url: `/s/assessments/${assessmentId}/grades`, arrayKey: "grades", items: [gradeItem(v)], label: "Notas lançadas" });
        queryClient.setQueryData<GradeSheetResult | null>(key, (cur) => (cur ? showQueuedGrade(cur, v) : cur));
        return "queued";
      }
    },
    onSuccess: (outcome) => {
      if (outcome === "queued") return; // sem rede, voltar a pedir a folha só a esvaziaria
      queryClient.invalidateQueries({ queryKey: key });
      queryClient.invalidateQueries({ queryKey: ["pautas", schoolId] });
    },
  });

  return {
    sheet: query.data?.sheet,
    pautaStatus: query.data?.pautaStatus,
    assessmentIds: query.data?.assessmentIds ?? {},
    isLoading: query.isLoading,
    isMissingAssignment: query.isSuccess && query.data === null,
    saveGrade,
  };
}

/** Periodos do ano letivo ativo (id + sequencia). */
export function useGradeTerms() {
  const schoolId = useActiveSchoolStore((s) => s.schoolId);
  return useQuery({ queryKey: ["terms", schoolId], queryFn: () => gradesService.terms(), enabled: Boolean(schoolId), staleTime: 5 * 60 * 1000 });
}

/** Trimestre em curso, usado como valor inicial dos seletores de notas e pautas. */
export function useCurrentTerm(): AssessmentTerm {
  const { data: terms = [] } = useGradeTerms();
  return useMemo(() => currentTerm(terms), [terms]);
}
