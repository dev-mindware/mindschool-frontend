"use client";

import { TermsMissingBanner } from "@/components/client/grades/terms-missing-banner";
import { useState } from "react";
import { SucessMessage, ErrorMessage } from "@/utils/messages";
import { StudentSelect } from "@/components/shared/filters/student-select";
import { Can, Badge, Button, ButtonOnlyAction, DataList, FormModal, FormSelect, Icon, TitleList, type Column } from "@/components";
import { downloadDocumentExcel, openDocumentPdf, useCertificates } from "@/hooks/school/use-certificates";
import { useGradeTerms } from "@/hooks/school/use-grades";
import { useStudents } from "@/hooks/school/use-students";
import { useModal } from "@/stores/modal/use-modal-store";
import { getApiErrorMessage } from "@/utils/api-error";
import { lastTerm } from "@/lib/terms";

type Doc = ReturnType<typeof useCertificates>["documents"][number];

function IssueBoletimModal() {
  const { students } = useStudents("");
  const { data: terms = [] } = useGradeTerms();
  const { issue } = useCertificates();
  const [studentId, setStudentId] = useState("");
  const [termId, setTermId] = useState("last");

  return (
    <FormModal id="boletim-issue" title="Emitir boletim de notas" description="Só se emite com a pauta do período fechada. O boletim é numerado e guardado em PDF e Excel." submitLabel="Emitir boletim" isLoading={issue.isPending} disabled={!studentId} onSubmit={() =>
      issue.mutateAsync({ studentId, documentType: "DECLARATION_WITH_GRADES", purpose: "Boletim de notas", termId: termId === "last" ? lastTerm(terms)?.id : termId })
        .then(async (d) => { SucessMessage(`Boletim ${d.documentNumber} emitido.`); await openDocumentPdf(d.id); })
        .catch((e) => { ErrorMessage(getApiErrorMessage(e, "Não foi possível emitir o boletim (a pauta do período tem de estar fechada).")); throw e; })}>
      <div className="sm:col-span-2"><StudentSelect label="Aluno *" students={students} value={studentId} onChange={setStudentId} /></div>
      <div className="sm:col-span-2"><FormSelect label="Período" value={termId} onValueChange={setTermId} options={[{ value: "last", label: "Último período iniciado" }, ...terms.map((t) => ({ value: t.id, label: `${t.sequence}.º Trimestre` }))]} /></div>
    </FormModal>
  );
}

/** Boletim de notas oficial: emitido pela API a partir das pautas fechadas, numerado e exportável em PDF e Excel. */
export function ReportCardsPageContent() {
  const { documents } = useCertificates();
  const { openModal } = useModal();
  const boletins = documents.filter((d) => d.documentType === "DECLARATION_WITH_GRADES");

  const columns: Column<Doc>[] = [
    { key: "documentNumber", header: "N.º", render: (_, d) => <Badge variant="outline" className="font-mono">{d.documentNumber}</Badge> },
    { key: "studentName", header: "Aluno", render: (_, d) => <span className="font-medium">{d.studentName}</span> },
    { key: "issueDate", header: "Emitido em", render: (_, d) => <span className="font-mono text-xs">{d.issueDate}</span> },
    {
      key: "action",
      header: "Ações",
      render: (_, d) => (
        <ButtonOnlyAction
          data={d}
          actions={[
            {
              label: "Abrir PDF",
              icon: "FileText",
              onClick: (x) => void openDocumentPdf(x.id).catch((e) => ErrorMessage(getApiErrorMessage(e, "Sem PDF."))),
            },
            {
              label: "Exportar Excel (.xlsx)",
              icon: "Download",
              onClick: (x) =>
                void downloadDocumentExcel(x.id, `Boletim_${x.documentNumber}.xlsx`).catch((e) =>
                  ErrorMessage(getApiErrorMessage(e, "Não foi possível descarregar em Excel.")),
                ),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <TermsMissingBanner />
      <TitleList title="Boletins de Notas" suTitle="Emissão do boletim oficial por aluno e período; só se emite com a pauta fechada.">
        <Can permission="document:issue"><Button size="sm" className="gap-2" onClick={() => openModal("boletim-issue")}><Icon name="FilePlus" className="size-4" />Emitir boletim</Button></Can>
      </TitleList>

      <DataList<Doc>
        prefix="boletins"
        rows={boletins}
        columns={columns}
        searchPlaceholder="Pesquisar por aluno ou número"
        searchText={(d) => `${d.studentName} ${d.documentNumber}`}
        dateFilters={[{ key: "emitido", label: "Emitido", getDate: (d) => d.issueDate }]}
        sorts={[{ value: "data", label: "Data de emissão", compare: (a, b) => a.issueDate.localeCompare(b.issueDate) }, { value: "aluno", label: "Aluno", compare: (a, b) => a.studentName.localeCompare(b.studentName) }]}
        emptyTitle="Ainda não há boletins emitidos"
        emptyDescription="Emita o primeiro boletim quando a pauta do período estiver fechada."
        emptyIcon="FileText"
      />

      <IssueBoletimModal />
    </div>
  );
}
