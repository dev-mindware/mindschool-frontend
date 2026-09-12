export type EnrollmentStatus = "ACTIVE" | "TRANSFERRED" | "CANCELLED";

export interface Enrollment {
  id: string;
  schoolId: string;
  enrollmentNumber: string; // ex: "MAT-2026/0128"
  studentId: string;
  studentName: string;
  studentNumber: string;
  academicYearId: string;
  academicYear: string;
  sectionId: string;
  sectionName: string;
  classLevelId: string;
  classLevelName: string;
  shift: string;
  enrollmentDate: string;
  status: EnrollmentStatus;
  cancellationReason?: string | null;
  cancellationDate?: string | null;
  cancelledBy?: string | null;
  tuitionPlanId: string;
  tuitionPlanName: string;
  monthlyTuitionPrice: number;
  hasScholarship?: boolean;
  scholarshipPercentage?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EnrollmentFormData {
  studentId?: string;
  // If enrolling a brand new student simultaneously
  isNewStudent?: boolean;
  newStudentData?: {
    fullName: string;
    gender: "MALE" | "FEMALE";
    birthDate: string;
    idDocumentType: "IDENTITY_CARD" | "BIRTH_CERTIFICATE" | "PASSPORT";
    idDocumentNumber: string;
    guardianName: string;
    guardianPhone: string;
    guardianRelationship: string;
  };
  sectionId: string;
  classLevelId: string;
  academicYear: string;
  tuitionPlanId: string;
  notes?: string;
}

export interface CancelEnrollmentFormData {
  enrollmentId: string;
  cancellationReason: string;
  cancellationDate: string;
}
