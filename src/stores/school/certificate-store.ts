import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  OfficialDocumentItem, 
  OfficialDocumentType, 
  DocumentMetrics 
} from '@/types/certificate';

interface CertificateState {
  documents: OfficialDocumentItem[];
  isLoading: boolean;
  searchQuery: string;
  filterType: OfficialDocumentType | 'ALL';

  // Actions
  setSearchQuery: (query: string) => void;
  setFilterType: (type: OfficialDocumentType | 'ALL') => void;
  issueDocument: (documentData: {
    documentType: OfficialDocumentType;
    studentId: string;
    studentName: string;
    studentNumber: string;
    classId: string;
    className: string;
    academicYear: string;
    purpose: string;
    issuedBy: string;
    notes?: string;
  }) => OfficialDocumentItem;
  markAsDelivered: (documentId: string) => void;
  revokeDocument: (documentId: string, reason: string) => void;
  getMetrics: () => DocumentMetrics;
}

const initialDocuments: OfficialDocumentItem[] = [
  {
    id: 'doc-001',
    documentNumber: 'DEC-2026/0048',
    documentType: 'DECLARATION_ENROLLMENT',
    studentId: 'std-luanda-001',
    studentName: 'Ana Clara Cassule dos Santos',
    studentNumber: 'MS-2026/001',
    classId: 'cls-7a',
    className: '7ª Classe - Turma A',
    academicYear: '2025/2026',
    issueDate: '2026-09-02',
    issuedBy: 'Secretaria - Maria Antónia',
    purpose: 'Para efeitos de Abono de Família junto do INSS',
    verificationCode: 'MS-VERIF-4819A',
    qrUrl: 'https://mindschool.ao/verify/MS-VERIF-4819A',
    isDeliveredToGuardian: true,
    status: 'ISSUED',
  },
  {
    id: 'doc-002',
    documentNumber: 'DEC-2026/0049',
    documentType: 'DECLARATION_WITH_GRADES',
    studentId: 'std-luanda-002',
    studentName: 'Manuel Domingos Baptista',
    studentNumber: 'MS-2026/014',
    classId: 'cls-8a',
    className: '8ª Classe - Turma A',
    academicYear: '2025/2026',
    issueDate: '2026-09-05',
    issuedBy: 'Secretaria - Carlos Manuel',
    purpose: 'Para efeitos de transferência de província (Luanda -> Benguela)',
    verificationCode: 'MS-VERIF-9284B',
    qrUrl: 'https://mindschool.ao/verify/MS-VERIF-9284B',
    isDeliveredToGuardian: true,
    status: 'ISSUED',
  },
  {
    id: 'doc-003',
    documentNumber: 'CERT-2026/0012',
    documentType: 'HABILITATION_CERTIFICATE',
    studentId: 'std-luanda-003',
    studentName: 'Graça Victória Nzuzi',
    studentNumber: 'MS-2026/032',
    classId: 'cls-9b',
    className: '9ª Classe - Turma B',
    academicYear: '2024/2025',
    issueDate: '2026-08-20',
    issuedBy: 'Direcção Pedagógica',
    purpose: 'Certificado de Habilitações Literárias do I Ciclo do Ensino Secundário',
    verificationCode: 'MS-VERIF-1038C',
    qrUrl: 'https://mindschool.ao/verify/MS-VERIF-1038C',
    isDeliveredToGuardian: false,
    status: 'PRINTED',
  },
];

export const useCertificateStore = create<CertificateState>()(
  persist(
    (set, get) => ({
      documents: initialDocuments,
      isLoading: false,
      searchQuery: '',
      filterType: 'ALL',

      setSearchQuery: (query) => set({ searchQuery: query }),

      setFilterType: (type) => set({ filterType: type }),

      issueDocument: (data) => {
        const { documents } = get();
        const nextNum = (documents.length + 50).toString().padStart(4, '0');
        const prefix = data.documentType === 'HABILITATION_CERTIFICATE' ? 'CERT' : 'DEC';
        const docNumber = `${prefix}-2026/${nextNum}`;
        const verifCode = `MS-VERIF-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

        const newDoc: OfficialDocumentItem = {
          id: `doc-${Date.now()}`,
          documentNumber: docNumber,
          documentType: data.documentType,
          studentId: data.studentId,
          studentName: data.studentName,
          studentNumber: data.studentNumber,
          classId: data.classId,
          className: data.className,
          academicYear: data.academicYear || '2025/2026',
          issueDate: new Date().toISOString().slice(0, 10),
          issuedBy: data.issuedBy,
          purpose: data.purpose,
          verificationCode: verifCode,
          qrUrl: `https://mindschool.ao/verify/${verifCode}`,
          isDeliveredToGuardian: false,
          status: 'ISSUED',
          notes: data.notes,
        };

        set({ documents: [newDoc, ...documents] });
        return newDoc;
      },

      markAsDelivered: (documentId) => {
        set((state) => ({
          documents: state.documents.map((d) =>
            d.id === documentId ? { ...d, isDeliveredToGuardian: true, status: 'PRINTED' } : d
          ),
        }));
      },

      revokeDocument: (documentId, reason) => {
        set((state) => ({
          documents: state.documents.map((d) =>
            d.id === documentId ? { ...d, status: 'REVOKED', notes: `ANULADO: ${reason}` } : d
          ),
        }));
      },

      getMetrics: () => {
        const { documents } = get();
        const activeDocs = documents.filter((d) => d.status !== 'REVOKED');
        const declarationsCount = activeDocs.filter((d) => d.documentType.startsWith('DECLARATION')).length;
        const certificatesCount = activeDocs.filter((d) => d.documentType === 'HABILITATION_CERTIFICATE').length;
        const pendingDeliveryCount = activeDocs.filter((d) => !d.isDeliveredToGuardian).length;

        return {
          totalIssued: activeDocs.length,
          declarationsCount,
          certificatesCount,
          pendingDeliveryCount,
        };
      },
    }),
    {
      name: 'mindschool-certificates-storage',
    }
  )
);
