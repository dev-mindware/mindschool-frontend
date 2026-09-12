import { PageWrapper } from "@/components";
import { ExtracurricularPageContent } from "@/components/client/academic/extracurricular";

export default function AcademicExtracurricularPage() {
  return (
    <PageWrapper
      routePath="/academic/extracurricular"
      routeLabel="Gestão Académica"
      subRoute="Actividades Extracurriculares & Desporto"
    >
      <ExtracurricularPageContent />
    </PageWrapper>
  );
}
