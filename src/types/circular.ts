export type CircularType =
  | "MEETING_CONVOCATION"     // Convocatória Oficial de Pais e Encarregados
  | "ACADEMIC_NOTICE"         // Circular Pedagógica (Provas, Pautas, Calendário)
  | "ADMINISTRATIVE_NOTICE"   // Aviso Administrativo (Uniformes, Horários, Secretaria)
  | "URGENT_ALERT"            // Alerta Urgente (Intempéries, Tolerância de Ponto)
  | "EVENT_ACTIVITY";         // Evento / Actividade Cultural ou Desportiva

export type AudienceType =
  | "ALL_SCHOOL"        // Toda a Comunidade Escolar
  | "PRIMARY"           // Ensino Primário (1ª à 6ª Classe)
  | "FIRST_CYCLE"       // I Ciclo do Ensino Secundário (7ª à 9ª Classe)
  | "SECOND_CYCLE"      // II Ciclo Geral / Técnico (10ª à 12ª/13ª Classe)
  | "SPECIFIC_CLASS"    // Turma Específica
  | "TEACHERS_ONLY"     // Apenas Corpo Docente
  | "GUARDIANS_ONLY";   // Apenas Encarregados de Educação

export type RsvpStatus = "CONFIRMED" | "DECLINED" | "PENDING";

export interface CircularRsvpItem {
  guardianId: string;
  guardianName: string;
  guardianPhone: string;
  studentName: string;
  className: string;
  status: RsvpStatus;
  notes?: string;
  respondedAt?: string;
}

export interface SchoolCircular {
  id: string;
  circularNumber: string; // e.g. "CIRC-2026/0014"
  title: string;
  subtitle?: string;
  content: string;
  type: CircularType;
  typeLabel: string;
  audience: AudienceType;
  audienceLabel: string;
  targetClassId?: string;
  targetClassName?: string;
  publishedAt: string; // YYYY-MM-DD HH:mm
  eventDate?: string;  // For meetings/events YYYY-MM-DD
  eventTime?: string;  // e.g. "09:30"
  eventLocation?: string; // e.g. "Salão Nobre do Colégio"
  agendaItems?: string[]; // Agenda da reunião
  isUrgent?: boolean;
  authorName: string;
  authorRole: string;
  totalRecipients: number;
  readCount: number;
  rsvpEnabled: boolean;
  rsvpList?: CircularRsvpItem[];
}
