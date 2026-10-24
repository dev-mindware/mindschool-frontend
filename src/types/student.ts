export type StudentGender = "MALE" | "FEMALE";

export type IdDocumentType = "IDENTITY_CARD" | "BIRTH_CERTIFICATE" | "PASSPORT";

export type StudentStatus = "ENROLLED" | "PENDING" | "TRANSFERRED" | "CANCELLED";

export interface Student {
  id: string;
  schoolId: string;
  studentNumber: string; // Número de Processo (ex: "MS-2026-0042")
  fullName: string;
  gender: StudentGender;
  birthDate: string;
  idDocumentType: IdDocumentType;
  idDocumentNumber: string;
  nif?: string;
  status: StudentStatus;
  guardianId: string;
  guardianName: string;
  guardianPhone: string;
  guardianRelationship: string;
  currentSectionId: string;
  currentSectionName: string;
  currentClassLevel: string;
  academicYear: string;
  photoUrl?: string;
  email?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudentFilterParams {
  search?: string;
  status?: StudentStatus | "ALL";
  classLevel?: string;
  sectionId?: string;
  page?: number;
  limit?: number;
}
