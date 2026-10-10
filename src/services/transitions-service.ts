import api from "./api";
import { gradesService } from "./grades-service";
import { pautasService } from "./pautas-service";
import type { ConsolidatedStudentRow, TransitionStatus } from "@/types/grade";

interface ApiProposal {
  enrollment_id: string;
  policy_version: string;
  confirmed_outcome: string | null;
  final_marks: Array<{ subject_id: string; name: string; final: string }>;
  proposal: { outcome: "transita" | "nao_transita" | "transita_com_apoio"; failing: unknown[]; rule: string; reason: string };
}

const STATUS: Record<ApiProposal["proposal"]["outcome"], TransitionStatus> = {
  transita: "APPROVED",
  transita_com_apoio: "APPROVED_WITH_CONDITIONS",
  nao_transita: "FAILED",
};

export type Outcome = ApiProposal["proposal"]["outcome"];

export const transitionsService = {
  /**
   * Proposta de progressao por aluno da turma (motor da API: media final por disciplina + excepcao da 7.a/8.a classe).
   * Sem as pautas de todos os periodos fechadas a API recusa (409): o aluno fica `PENDING`.
   */
  rows: async (sectionId: string): Promise<ConsolidatedStudentRow[]> => {
    const terms = await gradesService.terms();
    const roster = await pautasService.consolidated(sectionId, "TRIMESTER_1", terms);
    if (!roster) return [];
    return Promise.all(
      roster.students.map(async (s) => {
        try {
          const { data } = await api.get<ApiProposal>(`/s/enrollments/${s.id}/progression-proposal`);
          const finals = data.final_marks.map((m) => Number(m.final));
          const status: TransitionStatus = data.confirmed_outcome
            ? STATUS[data.confirmed_outcome as Outcome] ?? STATUS[data.proposal.outcome]
            : STATUS[data.proposal.outcome];
          return {
            ...s,
            termAverageTotal: finals.length ? Number((finals.reduce((a, b) => a + b, 0) / finals.length).toFixed(1)) : 0,
            failedSubjectsCount: data.proposal.failing.length,
            transitionStatus: status,
            exceptionApplied: data.proposal.reason,
          };
        } catch {
          return { ...s, transitionStatus: "PENDING" as TransitionStatus };
        }
      }),
    );
  },

  confirm: async (enrollmentId: string, outcome: Outcome, justification: string): Promise<void> => {
    await api.post(`/s/enrollments/${enrollmentId}/outcome`, { outcome, justification });
  },
};
