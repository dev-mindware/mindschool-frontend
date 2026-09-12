import { PageWrapper } from "@/components";
import { StudentAttendanceContent } from "@/components/client/academic/attendance";

export default function StudentAttendancePage() {
  return (
    <PageWrapper
      routePath="/academic/attendance"
      routeLabel="Gestão Académica"
      subRoute="Assiduidade & Disciplina dos Alunos"
    >
      <StudentAttendanceContent />
    </PageWrapper>
  );
}
