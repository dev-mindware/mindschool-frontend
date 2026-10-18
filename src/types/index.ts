// MindSchool Core Domain Types
export * from "./student";
export * from "./enrollment";
export * from "./guardian";
export * from "./academic";
export * from "./admission";
export * from "./grade";
export * from "./school-settings";
export * from "./student-attendance";
export * from "./teacher-attendance";
export * from "./secretary-request";
export * from "./dropout-risk";
export type {
  ExamQuestion,
  OnlineExam,
  QuestionOption,
  QuestionType,
  StudentExamSubmission,
  SubmissionStatus,
} from "./online-exam";
export { type ExamStatus } from "./online-exam";
export type { ExamStatus as AdmissionExamStatus } from "./admission";
export * from "./certificate";

// Platform & Financial (AGT Certified) Core Types
export * from "./auth";
export * from "./dashboard";
export * from "./notification";
export * from "./subscription";
export * from "./upload";
export * from "./chatbot";
export * from "./company";
