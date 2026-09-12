import { PageWrapper } from "@/components";
import { TimetablesPageContent } from "@/components/client/academic/timetables";

export default function AcademicTimetablesPage() {
  return (
    <PageWrapper
      routePath="/academic/timetables"
      routeLabel="Gestão Académica"
      subRoute="Horários Escolares & Grade Semanal"
    >
      <TimetablesPageContent />
    </PageWrapper>
  );
}
