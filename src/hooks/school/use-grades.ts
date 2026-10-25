"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { GradeField, GradeState, gradesService } from "@/services/grades-service";
import { useActiveSchoolStore } from "@/stores/school/active-school-store";
import { AssessmentTerm } from "@/types/grade";

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
    mutationFn: (v: { enrollmentId: string; field: GradeField; value?: number; status?: GradeState }) =>
      gradesService.saveGrade({ sectionId: sectionId!, subjectId: subjectId!, term: term!, ...v }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: key });
      queryClient.invalidateQueries({ queryKey: ["pautas", schoolId] });
    },
  });

  return {
    sheet: query.data?.sheet,
    pautaStatus: query.data?.pautaStatus,
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
