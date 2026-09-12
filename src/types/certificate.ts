export type OfficialDocumentType = 
  | 'DECLARATION_WITH_GRADES'
  | 'DECLARATION_ENROLLMENT'
  | 'HABILITATION_CERTIFICATE'
  | 'TRANSFER_GUIDE'
  | 'CONDUCT_CERTIFICATE';

export type DocumentStatus = 'ISSUED' | 'PRINTED' | 'REVOKED';

export interface OfficialDocumentItem {
  id: string;
  documentNumber: string; // Ex: DEC-2026/0142
  documentType: OfficialDocumentType;
  studentId: string;
  studentName: string;
  studentNumber: string;
  classId: string;
  className: string;
  academicYear: string;
  issueDate: string;
  issuedBy: string;
  purpose: string;
  verificationCode: string; // Ex: MS-VERIF-78A9C
  qrUrl: string;
  isDeliveredToGuardian: boolean;
  status: DocumentStatus;
  notes?: string;
}

export interface DocumentMetrics {
  totalIssued: number;
  declarationsCount: number;
  certificatesCount: number;
  pendingDeliveryCount: number;
}
