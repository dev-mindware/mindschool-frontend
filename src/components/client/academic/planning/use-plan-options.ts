"use client";

import { useMemo } from "react";
import { useGradeTerms } from "@/hooks/school/use-grades";
import { useSections } from "@/hooks/school/use-sections";
import { useTeachingScope } from "@/hooks/school/use-teaching-scope";

/** As disciplinas que o professor lecciona (por turma) e os períodos do ano: o que um plano precisa de escolher. */
export function usePlanOptions() {
  const { myAssignments } = useTeachingScope();
  const { data: sections = [] } = useSections();
  const terms = useGradeTerms();

  const assignments = useMemo(
    // `sectionName` já traz a classe («7.ª Classe Turma A»).
    () => myAssignments.map((a) => ({ ...a, classLevel: sections.find((s) => s.id === a.sectionId)?.classLevel ?? "", label: `${a.subjectName} · ${a.sectionName}` })),
    [myAssignments, sections],
  );
  const termOptions = useMemo(() => (terms.data ?? []).map((t) => ({ value: t.id, label: `${t.sequence}.º Trimestre` })), [terms.data]);

  return { assignments, termOptions };
}
