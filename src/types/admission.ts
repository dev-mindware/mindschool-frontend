export type AdmissionStatus =
  | 'SUBMITTED'
  | 'DOCS_VALIDATED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'WAITLIST'
  | 'REJECTED'
  | 'ENROLLED'
  | 'WITHDRAWN';

export type ExamPurpose = 'prova_admissao' | 'avaliacao_academica';

export type ExamStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'GRADING' | 'COMPLETED';

export interface Candidate {
  id: string;
  schoolId: string;
  fullName: string;
  gender: 'MALE' | 'FEMALE';
  birthDate: string;
  idDocumentType: 'IDENTITY_CARD' | 'BIRTH_CERTIFICATE' | 'PASSPORT';
  idDocumentNumber: string;
  nationality: string;
  guardianName: string;
  guardianPhone: string;
  guardianEmail?: string;
  guardianRelationship: 'FATHER' | 'MOTHER' | 'TUTOR' | 'OTHER';
  previousSchoolName?: string;
  convertedStudentId?: string;
  createdAt: string;
}

export interface AdmissionApplication {
  id: string;
  schoolId: string;
  applicationNumber: string; // Ex: CAND-2025/2026-0042
  candidateId: string;
  candidateName: string;
  candidateGender: 'MALE' | 'FEMALE';
  candidateBirthDate: string;
  candidateDocumentNumber: string;
  guardianName: string;
  guardianPhone: string;
  academicYearId: string;
  academicYear: string;
  desiredClassLevelId: string;
  desiredClassLevelName: string;
  desiredShift: 'MORNING' | 'AFTERNOON' | 'EVENING';
  requiresEntranceExam: boolean;
  entranceExamId?: string;
  entranceExamTitle?: string;
  examScore?: number; // 0 to 20
  minPassingScore: number; // default 10
  waitlistPosition?: number;
  status: AdmissionStatus;
  decisionNotes?: string;
  decidedBy?: string;
  decidedAt?: string;
  submissionDate: string;
  documentsVerifiedAt?: string;
}

export interface EntranceExam {
  id: string;
  schoolId: string;
  title: string;
  purpose: ExamPurpose;
  subjectName: string;
  classLevelId: string;
  classLevelName: string;
  examDate: string;
  roomNumber: string;
  maxCapacity: number;
  enrolledCandidatesCount: number;
  minPassingScore: number; // 10
  passingWeight: number; // 100% or weighted
  status: ExamStatus;
}

export interface CandidateExamSubmission {
  id: string;
  examId: string;
  candidateId: string;
  candidateName: string;
  candidateDocumentNumber: string;
  applicationId: string;
  numericScore?: number; // 0 to 20
  qualitativeFeedback?: string;
  isGraded: boolean;
  gradedBy?: string;
  gradedAt?: string;
}

export interface AdmissionFilterParams {
  search?: string;
  classLevelId?: string;
  status?: AdmissionStatus | 'ALL';
  shift?: string;
  academicYear?: string;
  page?: number;
  limit?: number;
}
