import { PageWrapper } from "@/components";
import { LibraryPageContent } from "@/components/client/academic/library";

export default function AcademicLibraryPage() {
  return (
    <PageWrapper
      routePath="/academic/library"
      routeLabel="Gestão Académica"
      subRoute="Biblioteca Escolar & Manuais do MED"
    >
      <LibraryPageContent />
    </PageWrapper>
  );
}
