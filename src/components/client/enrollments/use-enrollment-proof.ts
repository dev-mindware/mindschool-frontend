"use client";

import { SucessMessage, ErrorMessage } from "@/utils/messages";
import { openDocumentPdf, useCertificates } from "@/hooks/school/use-certificates";
import { Enrollment } from "@/types";
import { getApiErrorMessage } from "@/utils/api-error";

/** Emite (e abre em PDF) a declaração de frequência que serve de comprovativo de matrícula. */
export function useEnrollmentProof() {
  const { issue } = useCertificates();
  const emit = async (enrollment: Enrollment) => {
    try {
      const doc = await issue.mutateAsync({ studentId: enrollment.studentId, documentType: "DECLARATION_ENROLLMENT", purpose: `Comprovativo de matrícula ${enrollment.enrollmentNumber}` });
      SucessMessage(`Documento ${doc.documentNumber} emitido.`);
      await openDocumentPdf(doc.id);
    } catch (err) {
      ErrorMessage(getApiErrorMessage(err, "Não foi possível emitir o comprovativo."));
    }
  };
  return { emit, isPending: issue.isPending };
}
