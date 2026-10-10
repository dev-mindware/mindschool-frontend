"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { academicService } from "@/services/academic-service";
import { examsService, type ApiExam, type ApiExamStatus, type NewQuestion } from "@/services/exams-service";
import { useActiveSchoolStore } from "@/stores/school/active-school-store";
import { useGradeTerms } from "./use-grades";

/** Provas online da escola activa (nativas e em Google Forms) e as accoes do professor. */
export function useOnlineExams() {
  const schoolId = useActiveSchoolStore((s) => s.schoolId);
  const queryClient = useQueryClient();
  const key = ["online-exams", schoolId];
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setStatusFilter] = useState<ApiExamStatus | "ALL">("ALL");

  const { data: exams = [], isLoading } = useQuery({ queryKey: key, queryFn: examsService.list, enabled: Boolean(schoolId), staleTime: 15 * 1000 });
  const refresh = () => queryClient.invalidateQueries({ queryKey: key });

  const create = useMutation({ mutationFn: examsService.create, onSuccess: refresh });
  const addQuestion = useMutation({ mutationFn: (v: { examId: string; question: NewQuestion }) => examsService.addQuestion(v.examId, v.question), onSuccess: refresh });
  const removeQuestion = useMutation({ mutationFn: (v: { examId: string; questionId: string }) => examsService.removeQuestion(v.examId, v.questionId), onSuccess: refresh });
  const publish = useMutation({ mutationFn: examsService.publish, onSuccess: refresh });
  const close = useMutation({ mutationFn: examsService.close, onSuccess: refresh });

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return exams.filter(
      (e) =>
        (filterStatus === "ALL" || e.status === filterStatus) &&
        (!q || e.title.toLowerCase().includes(q) || (e.context?.subject_name ?? "").toLowerCase().includes(q) || (e.context?.section_name ?? "").toLowerCase().includes(q)),
    );
  }, [exams, searchQuery, filterStatus]);

  const metrics = useMemo(() => {
    const now = Date.now();
    return {
      total: exams.length,
      open: exams.filter((e) => e.status === "publicada" && new Date(e.opens_at).getTime() <= now && now <= new Date(e.closes_at).getTime()).length,
      googleForms: exams.filter((e) => e.delivery === "google_forms").length,
      drafts: exams.filter((e) => e.status === "rascunho").length,
    };
  }, [exams]);

  return { exams: filtered, allExams: exams, isLoading, metrics, searchQuery, setSearchQuery, filterStatus, setStatusFilter, create, addQuestion, removeQuestion, publish, close };
}

/** Atribuicoes (turma x disciplina) e periodos para elaborar uma prova. */
export function useExamTargets() {
  const schoolId = useActiveSchoolStore((s) => s.schoolId);
  const { data: terms = [] } = useGradeTerms();
  const { data: assignments = [] } = useQuery({ queryKey: ["assignments", schoolId], queryFn: academicService.assignments, enabled: Boolean(schoolId), staleTime: 60 * 1000 });
  return { assignments, terms };
}

/** Submissoes de uma prova + correccao + confirmacao (nota para a mini-pauta). */
export function useExamSubmissions(exam: ApiExam | null) {
  const schoolId = useActiveSchoolStore((s) => s.schoolId);
  const queryClient = useQueryClient();
  const examId = exam?.id;
  const key = ["exam-submissions", schoolId, examId];
  const { data: submissions = [], isLoading } = useQuery({ queryKey: key, queryFn: () => examsService.submissions(examId!), enabled: Boolean(schoolId && examId) });
  const refresh = (submissionId?: string) => {
    queryClient.invalidateQueries({ queryKey: key });
    if (submissionId) queryClient.invalidateQueries({ queryKey: ["exam-submission", schoolId, examId, submissionId] });
  };
  const gradeAnswer = useMutation({
    mutationFn: (v: { submissionId: string; answerId: string; score: number }) => examsService.gradeAnswer(examId!, v.submissionId, v.answerId, v.score),
    onSuccess: (_d, v) => refresh(v.submissionId),
  });
  const confirm = useMutation({ mutationFn: (submissionId: string) => examsService.confirm(examId!, submissionId), onSuccess: (_d, id) => refresh(id) });
  return { submissions, isLoading, gradeAnswer, confirm };
}

export function useExamSubmissionDetail(examId: string | undefined, submissionId: string | undefined) {
  const schoolId = useActiveSchoolStore((s) => s.schoolId);
  return useQuery({
    queryKey: ["exam-submission", schoolId, examId, submissionId],
    queryFn: () => examsService.submission(examId!, submissionId!),
    enabled: Boolean(schoolId && examId && submissionId),
  });
}

/** Ligacao da prova a um Google Form: criar, importar respostas, desligar. */
export function useGoogleForm(examId: string | undefined) {
  const schoolId = useActiveSchoolStore((s) => s.schoolId);
  const queryClient = useQueryClient();
  const key = ["exam-google-form", schoolId, examId];
  const status = useQuery({ queryKey: key, queryFn: () => examsService.formStatus(examId!), enabled: Boolean(schoolId && examId) });
  const google = useQuery({ queryKey: ["google-status", schoolId], queryFn: examsService.googleStatus, enabled: Boolean(schoolId), staleTime: 60 * 1000 });
  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: key });
    queryClient.invalidateQueries({ queryKey: ["online-exams", schoolId] });
    queryClient.invalidateQueries({ queryKey: ["exam-submissions", schoolId, examId] });
  };
  const link = useMutation({ mutationFn: (email: "verified" | "responder_input") => examsService.linkForm(examId!, email), onSuccess: refresh });
  const sync = useMutation({ mutationFn: () => examsService.syncForm(examId!), onSuccess: refresh });
  const unlink = useMutation({ mutationFn: () => examsService.unlinkForm(examId!), onSuccess: refresh });
  const connect = useMutation({ mutationFn: examsService.connectGoogle });
  return {
    status: status.data,
    isLoading: status.isLoading,
    googleConnected: Boolean(google.data?.connected),
    formsScopeGranted: Boolean(google.data?.scopes?.includes("forms.body")),
    link, sync, unlink, connect,
  };
}
