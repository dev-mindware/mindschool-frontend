"use client";
import { formatDate } from "@/utils";

import { useState } from "react";
import { FormModal, Icon } from "@/components";
import { StudentSelect } from "@/components/shared/filters/student-select";
import { useLibrary } from "@/hooks/school/use-library";
import { useSchoolSettingsStore } from "@/stores/school/school-settings-store";

/** "Nada Consta" da biblioteca: um aluno só está livre se não tiver empréstimos por devolver. */
export function ClearanceCertificateModal() {
  const { students, activeLoans, bookById } = useLibrary();
  const { profile } = useSchoolSettingsStore();
  const [studentId, setStudentId] = useState("");

  const student = students.find((s) => s.id === studentId);
  const pending = activeLoans.filter((l) => l.student_id === studentId);
  const cleared = Boolean(student) && pending.length === 0;

  return (
    <FormModal
      id="library-clearance"
      title="Declaração de Nada Consta"
      description="Verifique as pendências do aluno e transfira a declaração em PDF."
      size="lg"
      submitLabel="Baixar PDF"
      disabled={!cleared}
      keepOpen
      printContentId="library-clearance-print-content"
      pdfFilename={`Declaração_Nada_Consta_${student?.fullName || "aluno"}.pdf`}
      onSubmit={() => {}}
    >
      <div className="sm:col-span-2 print:hidden">
        <StudentSelect label="Aluno *" students={students} value={studentId} onChange={setStudentId} />
      </div>
      {student && (
        <div id="library-clearance-print-content" className="sm:col-span-2 space-y-4 rounded-xs border bg-white p-6 text-sm text-slate-900 print:border-0">
          <div className="space-y-1 border-b pb-3 text-center">
            <div className="text-sm font-black uppercase">{profile.schoolName}</div>
            <div className="text-[11px] text-slate-500">Biblioteca Escolar</div>
          </div>
          {cleared ? (
            <p>Declara-se que o aluno <strong>{student.fullName}</strong> <strong>não tem obras em seu poder</strong> nem pendências com a Biblioteca Escolar, estando livre para os devidos efeitos.</p>
          ) : (
            <div className="space-y-2">
              <p className="flex items-center gap-1.5 font-semibold text-rose-700"><Icon name="CircleAlert" className="size-4" />{student.fullName} tem {pending.length} obra(s) por devolver:</p>
              <ul className="list-disc pl-5 text-xs">{pending.map((l) => <li key={l.id}>{bookById.get(l.book_id)?.title ?? "Obra"} — devolver até {l.due_at}{l.overdue ? " (em atraso)" : ""}</li>)}</ul>
            </div>
          )}
          <div className="text-xs text-slate-500">Emitido em {formatDate(new Date())}</div>
        </div>
      )}
    </FormModal>
  );
}
