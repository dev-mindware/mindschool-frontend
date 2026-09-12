import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  AssessmentTerm,
  ClassSubjectGradeSheet,
  ConsolidatedPauta,
  ConsolidatedStudentRow,
  PautaAuditEntry,
  StudentGradeEntry,
  StudentReportCard,
  TransitionStatus,
} from "@/types/grade";
import { useSchoolDataStore } from "./school-data-store";

// Fórmulas Oficiais de Avaliação (Decreto Executivo n.º 424/25)
export function calculateMAS(mac?: number, npp?: number): number | undefined {
  if (mac === undefined && npp === undefined) return undefined;
  if (mac !== undefined && npp !== undefined) {
    return Number(((mac + npp) / 2).toFixed(1));
  }
  return mac !== undefined ? mac : npp;
}

export function calculateMT(mas?: number, npt?: number): number | undefined {
  if (mas === undefined || npt === undefined) return undefined;
  // MT = (2 x MAS + NPT) / 3
  return Number(((2 * mas + npt) / 3).toFixed(1));
}

export function calculateMF(mt1?: number, mt2?: number, mt3?: number): number | undefined {
  const validScores = [mt1, mt2, mt3].filter((s): s is number => s !== undefined);
  if (validScores.length === 0) return undefined;
  const sum = validScores.reduce((acc, v) => acc + v, 0);
  return Number((sum / validScores.length).toFixed(1));
}

// Motor de Transição Oficial do Subsistema de Ensino Geral (Anexo IV)
export function evaluateStudentTransition(
  classLevel: string,
  subjectScores: { subjectId: string; subjectName: string; score: number }[]
): { status: TransitionStatus; exceptionApplied?: string; failedCount: number } {
  const isLowerCycleException =
    classLevel.includes("7ª") || classLevel.includes("8ª");

  const failedSubjects = subjectScores.filter((s) => s.score < 10);
  const failedCount = failedSubjects.length;

  if (failedCount === 0) {
    return { status: "APPROVED", failedCount: 0 };
  }

  // Exceção Legal na 7.ª e 8.ª classe: até 2 disciplinas entre 7 e 9 valores,
  // desde que NÃO sejam simultaneamente Língua Portuguesa e Matemática.
  if (isLowerCycleException && failedCount <= 2) {
    const isAllBetween7And9 = failedSubjects.every(
      (s) => s.score >= 7.0 && s.score <= 9.4
    );

    const hasPortugueseFailed = failedSubjects.some((s) =>
      s.subjectName.toLowerCase().includes("português") || s.subjectName.toLowerCase().includes("portuguesa")
    );
    const hasMathFailed = failedSubjects.some((s) =>
      s.subjectName.toLowerCase().includes("matemática")
    );

    const isSimultaneousCriticalFail = hasPortugueseFailed && hasMathFailed;

    if (isAllBetween7And9 && !isSimultaneousCriticalFail) {
      return {
        status: "APPROVED_WITH_CONDITIONS",
        exceptionApplied: "Art.º 24.º Dec. 424/25: Transição condicional na 7ª/8ª classe (até 2 disciplinas 7-9 val., exceto LP+Mat)",
        failedCount,
      };
    }
  }

  if (failedCount <= 2) {
    return { status: "RECOVERY_EXAM", failedCount };
  }

  return { status: "FAILED", failedCount };
}

// Mock inicial de notas de alunos
const INITIAL_SHEETS: ClassSubjectGradeSheet[] = [
  {
    id: "sheet-7a-mat-t1",
    schoolId: "dev-school-1",
    sectionId: "sec-7a",
    sectionName: "7ª Classe A",
    classLevel: "7ª Classe",
    subjectId: "sub-mat",
    subjectName: "Matemática",
    teacherId: "tch-1",
    teacherName: "Prof. Domingos Kiala",
    term: "TRIMESTER_1",
    academicYear: "2025/2026",
    isLocked: false,
    updatedAt: "2026-01-15T10:00:00Z",
    entries: [
      {
        id: "entry-1-1",
        studentId: "stu-1",
        studentName: "Helena Chimpolo",
        studentNumber: "MS-2026-0001",
        continuousAssessment: 16.0,
        teacherTest: 14.5,
        systematicAverage: 15.3,
        termExam: 15.0,
        termAverage: 15.2,
      },
      {
        id: "entry-1-2",
        studentId: "stu-2",
        studentName: "Mauro Sebastião",
        studentNumber: "MS-2026-0002",
        continuousAssessment: 12.0,
        teacherTest: 11.0,
        systematicAverage: 11.5,
        termExam: 13.0,
        termAverage: 12.0,
      },
      {
        id: "entry-1-3",
        studentId: "stu-3",
        studentName: "Yara da Costa",
        studentNumber: "MS-2026-0003",
        continuousAssessment: 8.5,
        teacherTest: 8.0,
        systematicAverage: 8.3,
        termExam: 9.0,
        termAverage: 8.5,
      },
      {
        id: "entry-1-4",
        studentId: "stu-4",
        studentName: "Divaldo Francisco Gouveia",
        studentNumber: "MS-2026-0004",
        continuousAssessment: 14.0,
        teacherTest: 15.0,
        systematicAverage: 14.5,
        termExam: 14.0,
        termAverage: 14.3,
      },
    ],
  },
  {
    id: "sheet-7a-lp-t1",
    schoolId: "dev-school-1",
    sectionId: "sec-7a",
    sectionName: "7ª Classe A",
    classLevel: "7ª Classe",
    subjectId: "sub-lp",
    subjectName: "Língua Portuguesa",
    teacherId: "tch-2",
    teacherName: "Prof.ª Teresa Cassoma",
    term: "TRIMESTER_1",
    academicYear: "2025/2026",
    isLocked: false,
    updatedAt: "2026-01-16T11:00:00Z",
    entries: [
      {
        id: "entry-2-1",
        studentId: "stu-1",
        studentName: "Helena Chimpolo",
        studentNumber: "MS-2026-0001",
        continuousAssessment: 17.0,
        teacherTest: 16.0,
        systematicAverage: 16.5,
        termExam: 16.5,
        termAverage: 16.5,
      },
      {
        id: "entry-2-2",
        studentId: "stu-2",
        studentName: "Mauro Sebastião",
        studentNumber: "MS-2026-0002",
        continuousAssessment: 13.5,
        teacherTest: 14.0,
        systematicAverage: 13.8,
        termExam: 14.0,
        termAverage: 13.9,
      },
      {
        id: "entry-2-3",
        studentId: "stu-3",
        studentName: "Yara da Costa",
        studentNumber: "MS-2026-0003",
        continuousAssessment: 14.0,
        teacherTest: 13.0,
        systematicAverage: 13.5,
        termExam: 12.5,
        termAverage: 13.2,
      },
      {
        id: "entry-2-4",
        studentId: "stu-4",
        studentName: "Divaldo Francisco Gouveia",
        studentNumber: "MS-2026-0004",
        continuousAssessment: 12.0,
        teacherTest: 13.0,
        systematicAverage: 12.5,
        termExam: 11.5,
        termAverage: 12.2,
      },
    ],
  },
  {
    id: "sheet-7a-hist-t1",
    schoolId: "dev-school-1",
    sectionId: "sec-7a",
    sectionName: "7ª Classe A",
    classLevel: "7ª Classe",
    subjectId: "sub-hist",
    subjectName: "História",
    teacherId: "tch-1",
    teacherName: "Prof. Domingos Kiala",
    term: "TRIMESTER_1",
    academicYear: "2025/2026",
    isLocked: false,
    updatedAt: "2026-01-16T14:00:00Z",
    entries: [
      {
        id: "entry-3-1",
        studentId: "stu-1",
        studentName: "Helena Chimpolo",
        studentNumber: "MS-2026-0001",
        continuousAssessment: 18.0,
        teacherTest: 17.5,
        systematicAverage: 17.8,
        termExam: 18.0,
        termAverage: 17.9,
      },
      {
        id: "entry-3-2",
        studentId: "stu-2",
        studentName: "Mauro Sebastião",
        studentNumber: "MS-2026-0002",
        continuousAssessment: 15.0,
        teacherTest: 14.5,
        systematicAverage: 14.8,
        termExam: 15.0,
        termAverage: 14.9,
      },
      {
        id: "entry-3-3",
        studentId: "stu-3",
        studentName: "Yara da Costa",
        studentNumber: "MS-2026-0003",
        continuousAssessment: 8.0,
        teacherTest: 7.5,
        systematicAverage: 7.8,
        termExam: 8.0,
        termAverage: 7.9,
      },
      {
        id: "entry-3-4",
        studentId: "stu-4",
        studentName: "Divaldo Francisco Gouveia",
        studentNumber: "MS-2026-0004",
        continuousAssessment: 13.0,
        teacherTest: 12.5,
        systematicAverage: 12.8,
        termExam: 13.0,
        termAverage: 12.9,
      },
    ],
  },
];

const INITIAL_AUDIT_LOGS: PautaAuditEntry[] = [
  {
    id: "audit-1",
    pautaId: "pauta-sec-7a-t1",
    sectionId: "sec-7a",
    sectionName: "7ª Classe A",
    term: "TRIMESTER_1",
    action: "CLOSED",
    reason: "Fecho do 1.º Trimestre após verificação de 100% de notas lançadas pela Direção Pedagógica.",
    userId: "usr-dir",
    userName: "Prof. António Silva (Dir. Pedagógico)",
    timestamp: "2026-01-20T16:00:00Z",
  },
];

interface GradeState {
  gradeSheets: ClassSubjectGradeSheet[];
  auditLogs: PautaAuditEntry[];
  closedPautas: Record<string, { isClosed: boolean; closedAt?: string; closedBy?: string }>; // "sectionId_term" -> status

  // Actions
  updateGradeEntry: (
    sectionId: string,
    subjectId: string,
    term: AssessmentTerm,
    studentId: string,
    field: "continuousAssessment" | "teacherTest" | "termExam",
    value: number | undefined
  ) => void;

  lockMiniPauta: (
    sectionId: string,
    subjectId: string,
    term: AssessmentTerm,
    lockedBy: string
  ) => void;

  closeSectionPauta: (
    sectionId: string,
    term: AssessmentTerm,
    closedBy: string
  ) => { success: boolean; missingGradesCount: number };

  reopenSectionPauta: (
    sectionId: string,
    term: AssessmentTerm,
    reason: string,
    reopenedBy: string
  ) => void;

  getSectionGradeSheet: (
    sectionId: string,
    subjectId: string,
    term: AssessmentTerm
  ) => ClassSubjectGradeSheet | undefined;

  getConsolidatedPauta: (
    sectionId: string,
    term: AssessmentTerm
  ) => ConsolidatedPauta;

  getStudentReportCard: (
    studentId: string,
    academicYear?: string
  ) => StudentReportCard | null;

  resetToDefaultGrades: () => void;
}

export const useGradeStore = create<GradeState>()(
  persist(
    (set, get) => ({
      gradeSheets: INITIAL_SHEETS,
      auditLogs: INITIAL_AUDIT_LOGS,
      closedPautas: {
        "sec-7a_TRIMESTER_1": {
          isClosed: false,
        },
      },

      updateGradeEntry: (sectionId, subjectId, term, studentId, field, value) => {
        const key = `${sectionId}_${term}`;
        const pautaStatus = get().closedPautas[key];
        if (pautaStatus?.isClosed) {
          throw new Error("Não é possível alterar notas: a pauta trimestral desta turma está FECHADA.");
        }

        set((state) => {
          return {
            gradeSheets: state.gradeSheets.map((sheet) => {
              if (
                sheet.sectionId !== sectionId ||
                sheet.subjectId !== subjectId ||
                sheet.term !== term
              ) {
                return sheet;
              }

              const updatedEntries = sheet.entries.map((entry) => {
                if (entry.studentId !== studentId) return entry;

                const updatedEntry = { ...entry, [field]: value };

                // Recalcular MAS
                const newMAS = calculateMAS(
                  updatedEntry.continuousAssessment,
                  updatedEntry.teacherTest
                );
                updatedEntry.systematicAverage = newMAS;

                // Recalcular MT
                const newMT = calculateMT(newMAS, updatedEntry.termExam);
                updatedEntry.termAverage = newMT;

                return updatedEntry;
              });

              return {
                ...sheet,
                entries: updatedEntries,
                updatedAt: new Date().toISOString(),
              };
            }),
          };
        });
      },

      lockMiniPauta: (sectionId, subjectId, term, lockedBy) => {
        const now = new Date().toISOString();
        set((state) => ({
          gradeSheets: state.gradeSheets.map((s) =>
            s.sectionId === sectionId && s.subjectId === subjectId && s.term === term
              ? { ...s, isLocked: true, lockedAt: now, lockedBy }
              : s
          ),
        }));
      },

      closeSectionPauta: (sectionId, term, closedBy) => {
        const pauta = get().getConsolidatedPauta(sectionId, term);

        if (pauta.missingGradesCount > 0) {
          return { success: false, missingGradesCount: pauta.missingGradesCount };
        }

        const now = new Date().toISOString();
        const key = `${sectionId}_${term}`;

        const auditEntry: PautaAuditEntry = {
          id: `audit-${Date.now()}`,
          pautaId: `pauta-${key}`,
          sectionId,
          sectionName: pauta.sectionName,
          term,
          action: "CLOSED",
          reason: "Fecho trimestral homologado pela Direção Pedagógica com 100% das notas validadas.",
          userId: "usr-pedagogic",
          userName: closedBy,
          timestamp: now,
        };

        set((state) => ({
          closedPautas: {
            ...state.closedPautas,
            [key]: { isClosed: true, closedAt: now, closedBy },
          },
          auditLogs: [auditEntry, ...state.auditLogs],
        }));

        return { success: true, missingGradesCount: 0 };
      },

      reopenSectionPauta: (sectionId, term, reason, reopenedBy) => {
        const key = `${sectionId}_${term}`;
        const now = new Date().toISOString();
        const schoolStore = useSchoolDataStore.getState();
        const section = schoolStore.sections.find((s) => s.id === sectionId);

        const auditEntry: PautaAuditEntry = {
          id: `audit-${Date.now()}`,
          pautaId: `pauta-${key}`,
          sectionId,
          sectionName: section?.name || "Turma",
          term,
          action: "REOPENED",
          reason,
          userId: "usr-pedagogic",
          userName: reopenedBy,
          timestamp: now,
        };

        set((state) => ({
          closedPautas: {
            ...state.closedPautas,
            [key]: { isClosed: false },
          },
          auditLogs: [auditEntry, ...state.auditLogs],
        }));
      },

      getSectionGradeSheet: (sectionId, subjectId, term) => {
        const sheet = get().gradeSheets.find(
          (s) => s.sectionId === sectionId && s.subjectId === subjectId && s.term === term
        );

        if (sheet) return sheet;

        // Se não existir, criar dinamicamente para os alunos da turma
        const schoolStore = useSchoolDataStore.getState();
        const section = schoolStore.sections.find((s) => s.id === sectionId);
        const subject = schoolStore.subjects.find((s) => s.id === subjectId);
        const students = schoolStore.students.filter(
          (stu) => stu.currentSectionId === sectionId || stu.currentClassLevel === section?.classLevel
        );

        const entries: StudentGradeEntry[] = students.map((stu) => ({
          id: `entry-${sectionId}-${subjectId}-${stu.id}`,
          studentId: stu.id,
          studentName: stu.fullName,
          studentNumber: stu.studentNumber,
          continuousAssessment: 14,
          teacherTest: 13,
          systematicAverage: 13.5,
          termExam: 14,
          termAverage: 13.7,
        }));

        const newSheet: ClassSubjectGradeSheet = {
          id: `sheet-${sectionId}-${subjectId}-${term}`,
          schoolId: "dev-school-1",
          sectionId,
          sectionName: section?.name || "Turma",
          classLevel: section?.classLevel || "7ª Classe",
          subjectId,
          subjectName: subject?.name || "Disciplina",
          teacherId: "tch-default",
          teacherName: "Docente Titular",
          term,
          academicYear: "2025/2026",
          isLocked: false,
          entries,
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          gradeSheets: [...state.gradeSheets, newSheet],
        }));

        return newSheet;
      },

      getConsolidatedPauta: (sectionId, term) => {
        const schoolStore = useSchoolDataStore.getState();
        const section = schoolStore.sections.find((s) => s.id === sectionId);
        const sectionSubjects = schoolStore.subjects;
        const students = schoolStore.students.filter(
          (stu) => stu.currentSectionId === sectionId || stu.currentClassLevel === section?.classLevel
        );

        const sheets = get().gradeSheets.filter(
          (s) => s.sectionId === sectionId && s.term === term
        );

        const key = `${sectionId}_${term}`;
        const closedInfo = get().closedPautas[key];

        let totalMissing = 0;
        let sumAllAverages = 0;
        let approvedCount = 0;

        const studentRows: ConsolidatedStudentRow[] = students.map((stu) => {
          const subjectScores: Record<string, { mac?: number; npp?: number; mas?: number; npt?: number; mt?: number }> = {};
          const scoresForTransition: { subjectId: string; subjectName: string; score: number }[] = [];

          let studentSum = 0;
          let studentCount = 0;

          sectionSubjects.forEach((subj) => {
            const sheet = sheets.find((s) => s.subjectId === subj.id);
            const entry = sheet?.entries.find((e) => e.studentId === stu.id);

            if (entry && entry.termAverage !== undefined) {
              subjectScores[subj.id] = {
                mac: entry.continuousAssessment,
                npp: entry.teacherTest,
                mas: entry.systematicAverage,
                npt: entry.termExam,
                mt: entry.termAverage,
              };
              scoresForTransition.push({
                subjectId: subj.id,
                subjectName: subj.name,
                score: entry.termAverage,
              });
              studentSum += entry.termAverage;
              studentCount += 1;
            } else {
              subjectScores[subj.id] = {};
              totalMissing += 1;
            }
          });

          const studentAverage = studentCount > 0 ? Number((studentSum / studentCount).toFixed(1)) : 0;
          sumAllAverages += studentAverage;

          const transitionResult = evaluateStudentTransition(
            section?.classLevel || "7ª Classe",
            scoresForTransition
          );

          if (
            transitionResult.status === "APPROVED" ||
            transitionResult.status === "APPROVED_WITH_CONDITIONS"
          ) {
            approvedCount += 1;
          }

          return {
            id: stu.id,
            studentId: stu.id,
            studentName: stu.fullName,
            studentNumber: stu.studentNumber,
            subjects: subjectScores,
            termAverageTotal: studentAverage,
            failedSubjectsCount: transitionResult.failedCount,
            transitionStatus: transitionResult.status,
            exceptionApplied: transitionResult.exceptionApplied,
          };
        });

        const averageClassScore =
          students.length > 0 ? Number((sumAllAverages / students.length).toFixed(1)) : 0;
        const approvalRate =
          students.length > 0 ? Number(((approvedCount / students.length) * 100).toFixed(1)) : 0;

        return {
          id: `pauta-${key}`,
          schoolId: "dev-school-1",
          sectionId,
          sectionName: section?.name || "Turma",
          classLevel: section?.classLevel || "7ª Classe",
          shift: section?.shift === "MORNING" ? "Manhã" : "Tarde",
          term,
          academicYear: "2025/2026",
          isClosed: !!closedInfo?.isClosed,
          closedAt: closedInfo?.closedAt,
          closedBy: closedInfo?.closedBy,
          students: studentRows,
          missingGradesCount: totalMissing,
          averageClassScore,
          approvalRate,
        };
      },

      getStudentReportCard: (studentId, academicYear = "2025/2026") => {
        const schoolStore = useSchoolDataStore.getState();
        const student = schoolStore.students.find((s) => s.id === studentId);
        if (!student) return null;

        const section = schoolStore.sections.find((s) => s.id === student.currentSectionId);
        const subjects = schoolStore.subjects;

        const allSheets = get().gradeSheets;

        const subjectRows = subjects.map((subj) => {
          const sheetT1 = allSheets.find(
            (s) => s.sectionId === student.currentSectionId && s.subjectId === subj.id && s.term === "TRIMESTER_1"
          );
          const sheetT2 = allSheets.find(
            (s) => s.sectionId === student.currentSectionId && s.subjectId === subj.id && s.term === "TRIMESTER_2"
          );
          const sheetT3 = allSheets.find(
            (s) => s.sectionId === student.currentSectionId && s.subjectId === subj.id && s.term === "TRIMESTER_3"
          );

          const mt1 = sheetT1?.entries.find((e) => e.studentId === student.id)?.termAverage ?? 14.5;
          const mt2 = sheetT2?.entries.find((e) => e.studentId === student.id)?.termAverage ?? 15.0;
          const mt3 = sheetT3?.entries.find((e) => e.studentId === student.id)?.termAverage ?? 15.5;

          const finalScore = calculateMF(mt1, mt2, mt3) ?? 15.0;

          let qualitative = "Bom";
          let status: "APROVADO" | "RECURSO" | "REPROVADO" = "APROVADO";

          if (finalScore >= 16) qualitative = "Muito Bom";
          else if (finalScore >= 14) qualitative = "Bom";
          else if (finalScore >= 10) qualitative = "Suficiente";
          else if (finalScore >= 7) {
            qualitative = "Medíocre (Recurso)";
            status = "RECURSO";
          } else {
            qualitative = "Mau";
            status = "REPROVADO";
          }

          return {
            subjectId: subj.id,
            subjectName: subj.name,
            teacherName: "Docente Titular",
            mt1,
            mt2,
            mt3,
            finalScore,
            qualitativeEvaluation: qualitative,
            status,
          };
        });

        const globalSum = subjectRows.reduce((acc, r) => acc + r.finalScore, 0);
        const globalFinalScore = Number((globalSum / subjectRows.length).toFixed(1));

        const transition = evaluateStudentTransition(
          student.currentClassLevel,
          subjectRows.map((r) => ({ subjectId: r.subjectId, subjectName: r.subjectName, score: r.finalScore }))
        );

        let finalDecision = "Aprovado em todas as disciplinas curriculares.";
        if (transition.status === "APPROVED_WITH_CONDITIONS") {
          finalDecision = "Aprovado por deliberação do Conselho de Notas (Exceção Legal Art.º 24.º Dec. 424/25).";
        } else if (transition.status === "RECOVERY_EXAM") {
          finalDecision = "Não aprovado diretamente. Convocado para Prova de Recuperação / 2.ª Época.";
        } else if (transition.status === "FAILED") {
          finalDecision = "Não transita de classe por excesso de disciplinas não concluídas.";
        }

        return {
          studentId: student.id,
          studentName: student.fullName,
          studentNumber: student.studentNumber,
          sectionId: student.currentSectionId,
          sectionName: student.currentSectionName,
          classLevel: student.currentClassLevel,
          cycle: section?.cycle === "LOWER_SECONDARY" ? "I Ciclo do Ensino Secundário Geral" : "Ensino Secundário",
          shift: student.academicYear,
          academicYear,
          guardianName: student.guardianName,
          subjects: subjectRows,
          globalFinalScore,
          globalQualitative: globalFinalScore >= 14 ? "Bom Aproveitamento" : "Aproveitamento Regular",
          finalDecision,
          absencesCount: 4,
          pedagogicDirectorName: "Prof. António Silva",
          directorGeneralName: "Dr. Domingos Kiala",
          issuedAt: new Date().toISOString(),
        };
      },

      resetToDefaultGrades: () => {
        set({
          gradeSheets: INITIAL_SHEETS,
          auditLogs: INITIAL_AUDIT_LOGS,
          closedPautas: {},
        });
      },
    }),
    {
      name: "mindschool-grades-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
