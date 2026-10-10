"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/services/api";
import { fetchAllPages } from "@/services/api-pagination";
import { useActiveSchoolStore } from "@/stores/school/active-school-store";
import type { DocumentMetrics, DocumentStatus, OfficialDocumentItem, OfficialDocumentType } from "@/types/certificate";

type ApiDocType = "declaracao" | "termo_frequencia" | "boletim" | "certificado" | "diploma";

interface ApiDocument {
  id: string;
  student: { id: string; full_name: string };
  type: ApiDocType;
  document_number: string;
  issued_at: string;
}

/** Tipos do ecra -> tipos oficiais da API. Guia de transferencia nao existe na API. */
const TO_API: Partial<Record<OfficialDocumentType, ApiDocType>> = {
  DECLARATION_ENROLLMENT: "declaracao",
  DECLARATION_WITH_GRADES: "boletim",
  HABILITATION_CERTIFICATE: "certificado",
  CONDUCT_CERTIFICATE: "termo_frequencia",
};
const FROM_API: Record<ApiDocType, OfficialDocumentType> = {
  declaracao: "DECLARATION_ENROLLMENT",
  boletim: "DECLARATION_WITH_GRADES",
  certificado: "HABILITATION_CERTIFICATE",
  termo_frequencia: "CONDUCT_CERTIFICATE",
  diploma: "HABILITATION_CERTIFICATE",
};

const toItem = (d: ApiDocument): OfficialDocumentItem => ({
  id: d.id,
  documentNumber: d.document_number,
  documentType: FROM_API[d.type],
  studentId: d.student.id,
  studentName: d.student.full_name,
  studentNumber: "",
  classId: "",
  className: "",
  academicYear: "",
  issueDate: d.issued_at.slice(0, 10),
  issuedBy: "",
  purpose: "",
  verificationCode: d.document_number,
  qrUrl: `/documents/verify/${d.document_number}`,
  isDeliveredToGuardian: false,
  status: "ISSUED" as DocumentStatus,
});

/** Abre o PDF oficial (gerado e guardado pela API) num novo separador. */
export async function openDocumentPdf(documentId: string): Promise<void> {
  const { data } = await api.get<Blob>(`/s/documents/${documentId}/pdf`, { responseType: "blob" });
  window.open(URL.createObjectURL(data), "_blank");
}

/** Documentos oficiais emitidos (API `documents`), com a forma do antigo `useCertificateStore`. */
export function useCertificates() {
  const schoolId = useActiveSchoolStore((s) => s.schoolId);
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<OfficialDocumentType | "ALL">("ALL");

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ["documents", schoolId],
    queryFn: async () => (await fetchAllPages<ApiDocument>("/s/documents")).map(toItem),
    enabled: Boolean(schoolId),
    staleTime: 30 * 1000,
  });

  const issue = useMutation({
    mutationFn: async (v: { studentId: string; documentType: OfficialDocumentType; purpose: string; termId?: string }) => {
      const type = TO_API[v.documentType];
      if (!type) throw new Error("Este tipo de documento ainda não está disponível na API.");
      const { data } = await api.post<ApiDocument>(`/s/students/${v.studentId}/documents`, { type, purpose: v.purpose, ...(v.termId ? { term_id: v.termId } : {}) });
      return toItem(data);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["documents", schoolId] }),
  });

  const metrics: DocumentMetrics = useMemo(
    () => ({
      totalIssued: documents.length,
      declarationsCount: documents.filter((d) => d.documentType.startsWith("DECLARATION")).length,
      certificatesCount: documents.filter((d) => d.documentType === "HABILITATION_CERTIFICATE").length,
      pendingDeliveryCount: 0,
    }),
    [documents],
  );

  return { documents, isLoading, searchQuery, filterType, setSearchQuery, setFilterType, issue, getMetrics: () => metrics };
}
