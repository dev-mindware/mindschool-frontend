"use client";
import { useParams } from "next/navigation";
import { useDocumentVerification } from "@/hooks/documents/use-document-verification";
import { DocumentVerificationView } from "@/components/client/documents/public/document-verification-view";
import { Loader2, AlertCircle } from "lucide-react";

export default function DocumentVerifyPage() {
  const params = useParams();
  const token = params.token as string;

  const {
    data: document,
    isLoading,
    isError,
    error,
  } = useDocumentVerification(token);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-muted-foreground">Verificando documento...</p>
        </div>
      </div>
    );
  }

  if (isError || !document) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-lg shadow-sm border p-8 max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Documento não encontrado</h2>
          <p className="text-muted-foreground mb-4">
            O documento que está a tentar verificar não existe ou a ligação de
            verificação é inválido.
          </p>
          <p className="text-sm text-muted-foreground">
            {error instanceof Error ? error.message : "Erro desconhecido"}
          </p>
        </div>
      </div>
    );
  }

  return <DocumentVerificationView document={document} token={token} />;
}
