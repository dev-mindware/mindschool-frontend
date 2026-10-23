export type GuardianRelationship = "FATHER" | "MOTHER" | "UNCLE" | "GRANDPARENT" | "LEGAL_GUARDIAN" | "TUTOR" | "OTHER";

export type PreferredContactChannel = "WHATSAPP" | "SMS" | "EMAIL" | "PHONE_CALL";

export interface GuardianWard {
  studentId: string;
  studentName: string;
  relationship: GuardianRelationship;
  isPrimaryContact?: boolean;
}

export interface Guardian {
  id: string;
  schoolId: string;
  fullName: string;
  idDocumentType?: string;
  idDocumentNumber?: string;
  /** NIF opcional (cliente da factura-recibo). */
  nif?: string;
  phonePrimary: string;
  phoneSecondary?: string;
  email?: string;
  address?: string;
  profession?: string;
  workplace?: string;
  preferredContactChannel: PreferredContactChannel;
  wards: GuardianWard[];
  createdAt: string;
  updatedAt: string;
}
