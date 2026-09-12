import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  RequestType,
  RequestStatus,
  RequestPriority,
  DirectorDispatch,
  SecretaryRequest,
} from "@/types";

interface SecretaryRequestState {
  requests: SecretaryRequest[];
  searchQuery: string;
  statusFilter: string;
  typeFilter: string;

  // Actions
  setSearchQuery: (q: string) => void;
  setStatusFilter: (status: string) => void;
  setTypeFilter: (type: string) => void;

  submitRequest: (
    data: Omit<SecretaryRequest, "id" | "protocolNumber" | "submittedAt" | "status" | "targetDate">
  ) => SecretaryRequest;

  updateStatus: (id: string, status: RequestStatus, notes?: string) => void;
  dispatchRequest: (id: string, dispatch: DirectorDispatch) => void;
  markAsDelivered: (id: string, deliveredTo: string) => void;
  markFeeAsPaid: (id: string) => void;
}

const INITIAL_REQUESTS: SecretaryRequest[] = [
  {
    id: "req-148",
    protocolNumber: "PROT-2026/0148",
    studentId: "stu-01",
    studentName: "Afonso Sebastião Bento",
    studentNumber: "MS-2026-0012",
    className: "9ª Classe A",
    guardianName: "Eng. Sebastião Bento",
    guardianPhone: "+244 923 111 222",
    type: "DECLARATION_VISA",
    typeLabel: "Declaração para Embaixada / Visto",
    priority: "URGENT",
    status: "READY_FOR_PICKUP",
    purpose: "Pedido de Visto de Estudos no Consulado Geral de Portugal em Luanda",
    slaDays: 2,
    submittedAt: "2026-03-08 09:30",
    targetDate: "2026-03-10",
    feeAmountKz: 5000,
    isPaid: true,
    notes: "Documentação autenticada com selo branco e assinatura reconhecida.",
    dispatch: {
      decision: "APPROVED",
      observations: "Emitida declaração consular com notas discriminadas e menção de conduta exemplar.",
      dispatchedBy: "Dr. Alberto Manuel Domingos (Director Geral)",
      dispatchedAt: "2026-03-09 11:00",
    },
  },
  {
    id: "req-149",
    protocolNumber: "PROT-2026/0149",
    studentId: "stu-08",
    studentName: "Helena Luísa Kapita",
    studentNumber: "MS-2026-0038",
    className: "9ª Classe A",
    guardianName: "Dra. Luísa Kapita",
    guardianPhone: "+244 931 444 555",
    type: "TRANSFER_GUIDE",
    typeLabel: "Guia de Transferência Escolar",
    priority: "NORMAL",
    status: "PENDING_DIRECTOR",
    purpose: "Mudança de residência da família para a Província do Huambo",
    slaDays: 5,
    submittedAt: "2026-03-07 14:15",
    targetDate: "2026-03-12",
    feeAmountKz: 8000,
    isPaid: true,
    notes: "Apresentou declaração de aceitação da escola de destino.",
  },
  {
    id: "req-150",
    protocolNumber: "PROT-2026/0150",
    studentId: "stu-03",
    studentName: "Carlos Daniel Kiala",
    studentNumber: "MS-2026-0025",
    className: "9ª Classe A",
    guardianName: "Sr. Daniel Kiala",
    guardianPhone: "+244 924 777 888",
    type: "GRADE_REVIEW",
    typeLabel: "Revisão de Prova / Reclamação",
    priority: "NORMAL",
    status: "UNDER_REVIEW",
    purpose: "Reclamação da cotação na Prova do Professor de Matemática (1º Trimestre)",
    slaDays: 3,
    submittedAt: "2026-03-09 08:40",
    targetDate: "2026-03-12",
    feeAmountKz: 2500,
    isPaid: true,
    notes: "Encaminhado para a Coordenação Pedagógica de Matemática para recontagem.",
  },
  {
    id: "req-151",
    protocolNumber: "PROT-2026/0151",
    studentId: "stu-05",
    studentName: "Eduardo José Van-Dúnem",
    studentNumber: "MS-2026-0050",
    className: "9ª Classe A",
    guardianName: "Sra. Teresa Van-Dúnem",
    guardianPhone: "+244 912 333 999",
    type: "CLASS_SHIFT_CHANGE",
    typeLabel: "Mudança de Turma ou Turno",
    priority: "NORMAL",
    status: "APPROVED",
    purpose: "Incompatibilidade de horário com treinos da Academia de Natação",
    slaDays: 3,
    submittedAt: "2026-03-06 10:00",
    targetDate: "2026-03-09",
    feeAmountKz: 3000,
    isPaid: true,
    notes: "Existe vaga disponível na Turma B do mesmo ano lectivo.",
    dispatch: {
      decision: "APPROVED",
      observations: "Transferência de turno autorizada para o início do próximo mês.",
      dispatchedBy: "Profª. Maria Teresa Diogo da Silva (Directora Pedagógica)",
      dispatchedAt: "2026-03-08 16:30",
    },
  },
  {
    id: "req-152",
    protocolNumber: "PROT-2026/0152",
    studentId: "stu-02",
    studentName: "Ana Beatriz Domingos",
    studentNumber: "MS-2026-0013",
    className: "9ª Classe A",
    guardianName: "Sr. Fernando Domingos",
    guardianPhone: "+244 945 888 111",
    type: "STUDENT_CARD_REISSUE",
    typeLabel: "2ª Via de Cartão de Estudante",
    priority: "NORMAL",
    status: "COMPLETED",
    purpose: "Extravio do cartão de estudante no transporte escolar",
    slaDays: 1,
    submittedAt: "2026-03-05 11:20",
    targetDate: "2026-03-06",
    feeAmountKz: 2000,
    isPaid: true,
    deliveredAt: "2026-03-06 15:00",
    deliveredTo: "Próprio Encarregado (Fernando Domingos)",
  },
];

export const useSecretaryRequestStore = create<SecretaryRequestState>()(
  persist(
    (set, get) => ({
      requests: INITIAL_REQUESTS,
      searchQuery: "",
      statusFilter: "ALL",
      typeFilter: "ALL",

      setSearchQuery: (searchQuery) => set({ searchQuery }),
      setStatusFilter: (statusFilter) => set({ statusFilter }),
      setTypeFilter: (typeFilter) => set({ typeFilter }),

      submitRequest: (data) => {
        const currentYear = new Date().getFullYear();
        const nextNum = get().requests.length + 153;
        const protocolNumber = `PROT-${currentYear}/${String(nextNum).padStart(4, "0")}`;

        const submittedAt = new Date().toISOString().slice(0, 16).replace("T", " ");
        const targetDateObj = new Date();
        targetDateObj.setDate(targetDateObj.getDate() + (data.slaDays || 3));
        const targetDate = targetDateObj.toISOString().slice(0, 10);

        const newRequest: SecretaryRequest = {
          ...data,
          id: `req-${Date.now()}`,
          protocolNumber,
          submittedAt,
          targetDate,
          status: "SUBMITTED",
        };

        set((state) => ({
          requests: [newRequest, ...state.requests],
        }));

        return newRequest;
      },

      updateStatus: (id, status, notes) => {
        set((state) => ({
          requests: state.requests.map((r) =>
            r.id === id
              ? {
                  ...r,
                  status,
                  notes: notes !== undefined ? notes : r.notes,
                }
              : r
          ),
        }));
      },

      dispatchRequest: (id, dispatch) => {
        set((state) => ({
          requests: state.requests.map((r) => {
            if (r.id !== id) return r;
            const newStatus: RequestStatus =
              dispatch.decision === "APPROVED"
                ? "APPROVED"
                : dispatch.decision === "REJECTED"
                ? "REJECTED"
                : "UNDER_REVIEW";

            return {
              ...r,
              status: newStatus,
              dispatch,
            };
          }),
        }));
      },

      markAsDelivered: (id, deliveredTo) => {
        set((state) => ({
          requests: state.requests.map((r) =>
            r.id === id
              ? {
                  ...r,
                  status: "COMPLETED" as RequestStatus,
                  deliveredAt: new Date().toISOString().slice(0, 16).replace("T", " "),
                  deliveredTo,
                }
              : r
          ),
        }));
      },

      markFeeAsPaid: (id) => {
        set((state) => ({
          requests: state.requests.map((r) =>
            r.id === id ? { ...r, isPaid: true } : r
          ),
        }));
      },
    }),
    {
      name: "mindschool-secretary-requests-storage",
    }
  )
);
