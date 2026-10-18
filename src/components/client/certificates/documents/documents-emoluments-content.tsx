"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Button,
  Can,
  Icon,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  TitleList,
} from "@/components";
import { DynamicMetricCard } from "@/components/shared/dynamic-metric-card";
import { useCertificates, openDocumentPdf } from "@/hooks/school/use-certificates";
import { useSecretaryRequests } from "@/hooks/school/use-secretary-requests";
import { useStudents } from "@/hooks/school/use-students";
import { useGradeTerms } from "@/hooks/school/use-grades";
import { useModal } from "@/stores/modal/use-modal-store";
import { SucessMessage, ErrorMessage } from "@/utils/messages";
import { getApiErrorMessage } from "@/utils/api-error";
import { OfficialDocumentItem, OfficialDocumentType } from "@/types/certificate";
import { Student } from "@/types";

// Componentes das abas
import { RequestsTable } from "@/components/client/secretary/requests/requests-table";
import { NewRequestModal } from "@/components/client/secretary/requests/new-request-modal";
import { CertificatesTable } from "@/components/client/certificates/certificates-table";
import {
  IssueDocumentModal,
  ISSUE_DOCUMENT_MODAL_ID,
} from "@/components/client/certificates/issue-document-modal";
import { DocumentFeesSection } from "@/modules/finance/components/document-fees-section";

export function DocumentsEmolumentsContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") || "requests";
  const [activeTab, setActiveTab] = useState(initialTab);

  const { documents, issue, deleteDocument, isLoading: isLoadingDocs } = useCertificates();
  const { counts } = useSecretaryRequests();
  const { allStudents: students } = useStudents();
  const { data: terms = [] } = useGradeTerms();
  const { openModal } = useModal();

  const handleDeleteDocument = async (doc: OfficialDocumentItem) => {
    try {
      await deleteDocument.mutateAsync(doc.id);
      SucessMessage(`Documento ${doc.documentNumber} eliminado com sucesso.`);
    } catch (err: unknown) {
      ErrorMessage(getApiErrorMessage(err, "Não foi possível eliminar o documento."));
      throw err;
    }
  };

  const handleIssueSave = async (docData: {
    documentType: OfficialDocumentType;
    student: Student;
    purpose: string;
    notes?: string;
    issuerRole: string;
    checkedByName?: string;
    registryBook?: string;
    registrySheet?: string;
  }) => {
    try {
      const termId =
        docData.documentType === "DECLARATION_WITH_GRADES"
          ? terms[terms.length - 1]?.id
          : undefined;
      const doc = await issue.mutateAsync({
        studentId: docData.student.id,
        documentType: docData.documentType,
        purpose: docData.purpose,
        termId,
        checkedByName: docData.checkedByName,
        registryBook: docData.registryBook,
        registrySheet: docData.registrySheet,
      });
      SucessMessage(`Documento ${doc.documentNumber} emitido com sucesso!`);
      await openDocumentPdf(doc.id);
    } catch (err: unknown) {
      ErrorMessage(getApiErrorMessage(err, "Não foi possível emitir o documento."));
      throw err;
    }
  };

  const handleViewPreview = async (doc: OfficialDocumentItem) => {
    try {
      await openDocumentPdf(doc.id);
    } catch (err: unknown) {
      ErrorMessage(getApiErrorMessage(err, "Não foi possível abrir o PDF."));
    }
  };

  const totalEmolumentsProcessed = useMemo(() => {
    return counts.total;
  }, [counts.total]);

  return (
    <div className="space-y-6">
      <TitleList
        title="Emissão de Emolumentos & Documentos da Secretaria"
        suTitle="Gestão integrada de protocolos, cobrança de taxas de secretaria e emissão de documentos timbrados."
      >
        <div className="flex flex-wrap items-center gap-2">
          <Can permission="request:write">
            <Button
              size="sm"
              onClick={() => openModal("request-new")}
              className="gap-2 shadow-xs"
            >
              <Icon name="FilePlus" className="size-4" />
              Novo Requerimento
            </Button>
          </Can>
          <Can permission="document:issue">
            <Button
              size="sm"
              variant="outline"
              onClick={() => openModal(ISSUE_DOCUMENT_MODAL_ID)}
              className="gap-2 shadow-xs"
            >
              <Icon name="Plus" className="size-4" />
              Emissão Direta (Balcão)
            </Button>
          </Can>
        </div>
      </TitleList>

      {/* Painel de Métricas Integradas */}
      <div className="grid grid-cols-2 gap-3 md:gap-4 @5xl/main:grid-cols-4">
        <DynamicMetricCard
          title={totalEmolumentsProcessed}
          subtitle="Requerimentos Registados"
          description="Total de processos tramitados"
          icon="Files"
        />
        <DynamicMetricCard
          title={counts.open}
          subtitle="Por Tratar / Pendentes"
          description="Aguarda pagamento ou análise"
          icon="Clock"
        />
        <DynamicMetricCard
          title={counts.inReview}
          subtitle="Em Análise"
          description="A ser tratados pela secretaria"
          icon="Search"
        />
        <DynamicMetricCard
          title={documents.length}
          subtitle="Documentos Emitidos"
          description="Certificados e declarações timbradas"
          icon="FileCheck"
        />
      </div>

      {/* Abas Unificadas */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 max-w-xl">
          <TabsTrigger value="requests" className="gap-2">
            <Icon name="Inbox" className="size-4" />
            <span>Requerimentos & Taxas</span>
          </TabsTrigger>
          <TabsTrigger value="issued" className="gap-2">
            <Icon name="FileText" className="size-4" />
            <span>Documentos Emitidos ({documents.length})</span>
          </TabsTrigger>
          <TabsTrigger value="fees" className="gap-2">
            <Icon name="Coins" className="size-4" />
            <span>Tabela de Emolumentos</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="space-y-4">
          <RequestsTable />
        </TabsContent>

        <TabsContent value="issued" className="space-y-4">
          <CertificatesTable
            documents={documents}
            isLoading={isLoadingDocs}
            onViewPreview={handleViewPreview}
            onDelete={handleDeleteDocument}
          />
        </TabsContent>

        <TabsContent value="fees" className="space-y-4">
          <DocumentFeesSection />
        </TabsContent>
      </Tabs>

      {/* Modais Globais do Módulo */}
      <NewRequestModal />
      <IssueDocumentModal students={students} onIssue={handleIssueSave} />
    </div>
  );
}
