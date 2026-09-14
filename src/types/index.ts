// MindSchool Core Domain Types
export * from "./student";
export * from "./enrollment";
export * from "./guardian";
export * from "./academic";
export * from "./admission";
export * from "./grade";
export * from "./tuition";
export * from "./academic-performance";
export * from "./school-settings";
export * from "./timetable";
export * from "./student-attendance";
export * from "./teacher-attendance";
export * from "./secretary-request";
export * from "./circular";
export * from "./library";
export * from "./health";
export * from "./transport";
export * from "./extracurricular";
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
export * from "./reports-med";
export * from "./multi-school";
export * from "./certificate";

// Platform & Financial (AGT Certified) Core Types
export * from "./auth";
export * from "./company";
export * from "./dashboard";
export * from "./documents";
export * from "./invoice-proforma";
export type { PaymentMethod } from "./documents";
export * from "./notification";
export * from "./subscription";
export * from "./upload";
export * from "./audit-trail";
export * from "./contributor";
export * from "./agt";
export * from "./tax";
export * from "./reports";
export * from "./chatbot";
