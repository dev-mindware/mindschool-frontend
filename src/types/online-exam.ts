export type QuestionType = 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER' | 'ESSAY';

export type ExamStatus = 'DRAFT' | 'PUBLISHED' | 'IN_PROGRESS' | 'CLOSED' | 'GRADED';

export type SubmissionStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'SUBMITTED' | 'GRADED';

export interface QuestionOption {
  id: string;
  label: string; // ex: "A", "B", "C", "D"
  text: string;
}

export interface ExamQuestion {
  id: string;
  type: QuestionType;
  prompt: string;
  points: number; // Ex: 4.0 valores
  options?: QuestionOption[]; // Para MULTIPLE_CHOICE
  correctAnswer?: string; // Para MULTIPLE_CHOICE, TRUE_FALSE e SHORT_ANSWER
  rubricCriteria?: string; // Critérios de avaliação para ESSAY
}

export interface OnlineExam {
  id: string;
  title: string;
  subjectId: string;
  subjectName: string;
  classId: string;
  className: string;
  term: 1 | 2 | 3;
  academicYear: string;
  durationMinutes: number;
  totalPoints: number; // Padrão 20.0 valores (Decreto 424/25)
  passingPoints: number; // Padrão 10.0 valores
  questions: ExamQuestion[];
  status: ExamStatus;
  startDate: string; // YYYY-MM-DD HH:mm
  endDate: string; // YYYY-MM-DD HH:mm
  createdByTeacherId: string;
  createdByTeacherName: string;
  createdAt: string;
}

export interface StudentExamSubmission {
  id: string;
  examId: string;
  studentId: string;
  studentName: string;
  studentNumber: string;
  startedAt?: string;
  submittedAt?: string;
  answers: Record<string, string>; // questionId -> answer text / optionId
  essayScores: Record<string, number>; // questionId -> score assigned by teacher
  essayFeedback: Record<string, string>; // questionId -> feedback note
  objectiveScore: number;
  essayScore: number;
  totalScore: number; // 0 to 20
  status: SubmissionStatus;
  isPushedToGradebook: boolean;
  pushedAt?: string;
}

export interface ExamMetrics {
  totalExams: number;
  activeExamsCount: number;
  evaluatedStudentsCount: number;
  autoGradingAccuracyPercentage: number;
  averageScore: number;
}
