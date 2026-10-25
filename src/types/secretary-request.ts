export type RequestType =
  | "DECLARATION_SIMPLE"      // Declaração de Matrícula (Simples / Sem Notas)
  | "DECLARATION_GRADES"      // Declaração com Notas / Histórico Escolar
  | "DECLARATION_VISA"        // Declaração para Embaixada / Visto
  | "TRANSFER_GUIDE"          // Guia de Transferência Escolar
  | "CLASS_SHIFT_CHANGE"      // Mudança de Turma ou Turno
  | "GRADE_REVIEW"            // Revisão de Prova / Reclamação de Avaliação
  | "STUDENT_CARD_REISSUE"    // 2ª Via de Cartão de Estudante
  | "ENROLLMENT_CANCELLATION"; // Anulação / Desistência de Matrícula

export type RequestPriority = "NORMAL" | "URGENT";

export type RequestStatus =
  | "SUBMITTED"           // Submetido (Aguardando triagem)
  | "UNDER_REVIEW"        // Em Análise na Secretaria
  | "PENDING_DIRECTOR"    // Aguardando Despacho da Direção
  | "APPROVED"            // Deferido / Aprovado
  | "REJECTED"            // Indeferido
  | "READY_FOR_PICKUP"    // Pronto para Levantamento / Emissão Concluída
  | "COMPLETED";          // Entregue ao Requerente / Concluído

export interface DirectorDispatch {
  decision: "APPROVED" | "REJECTED" | "NEEDS_INFO";
  observations: string;
  dispatchedBy: string; // e.g. "Dr. Sebastião Quaresma (Diretor Geral)"
  dispatchedAt: string;
}

export interface SecretaryRequest {
  id: string;
  protocolNumber: string; // e.g. "PROT-2026/0148"
  studentId: string;
  studentName: string;
  studentNumber: string;
  className: string;
  guardianName: string;
  guardianPhone: string;
  type: RequestType;
  typeLabel: string;
  priority: RequestPriority;
  status: RequestStatus;
  purpose?: string; // Purpose / Destination (e.g. "Para fins de abono de família no INSS")
  slaDays: number;
  submittedAt: string; // YYYY-MM-DD HH:mm
  targetDate: string;  // Previsão de Entrega YYYY-MM-DD
  feeAmountKz: number; // Emolumento / Taxa de Secretaria em Kwanzas
  isPaid: boolean;
  notes?: string;
  dispatch?: DirectorDispatch;
  deliveredAt?: string;
  deliveredTo?: string;
}
