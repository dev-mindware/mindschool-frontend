import { PageWrapper } from "@/components";
import { ApiReportsCatalog } from "@/components/client/reports/common";

export default function ReportsAcademicPage() {
  return (
    <PageWrapper>
      <ApiReportsCatalog
        domains={["academico", "avaliacao", "secretaria", "docentes", "documentos"]}
        title="Relatórios académicos oficiais"
        description="Alunos, matrículas, aproveitamento por disciplina, progressão, carga horária e mais — com pré-visualização e exportação em Excel, PDF e CSV."
      />
    </PageWrapper>
  );
}
