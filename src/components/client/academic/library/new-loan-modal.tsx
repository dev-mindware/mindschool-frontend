"use client";

import { useEffect, useState } from "react";
import { SucessMessage, ErrorMessage } from "@/utils/messages";
import { Button, FormCombobox, FormModal } from "@/components";
import { useLibrary } from "@/hooks/school/use-library";
import { useModal } from "@/stores/modal/use-modal-store";
import { getApiErrorMessage } from "@/utils/api-error";

export function NewLoanModal() {
  const { allBooks, students, teachers, lend } = useLibrary();
  const { open, modalData } = useModal();
  const [kind, setKind] = useState<"student" | "teacher">("student");
  const [bookId, setBookId] = useState("");
  const [readerId, setReaderId] = useState("");

  useEffect(() => {
    if (open["library-new-loan"]) setBookId((modalData["library-new-loan"] as { bookId?: string } | undefined)?.bookId ?? "");
  }, [open, modalData]);

  const readers = kind === "student" ? students.map((s) => ({ value: s.id, label: s.fullName })) : teachers.map((t) => ({ value: t.id, label: t.full_name }));

  const submit = () =>
    lend
      .mutateAsync({ bookId, ...(kind === "student" ? { studentId: readerId } : { teacherId: readerId }) })
      .then((loan) => { SucessMessage(`Empréstimo registado. Devolver até ${loan.due_at}.`); setReaderId(""); })
      .catch((err) => { ErrorMessage(getApiErrorMessage(err, "Não foi possível registar o empréstimo.")); throw err; });

  return (
    <FormModal id="library-new-loan" title="Novo Empréstimo" description="Prazo de 14 dias. Leitores com atrasos ou no limite de obras (3 alunos / 5 docentes) não podem levar mais." submitLabel="Registar" isLoading={lend.isPending} onSubmit={submit} disabled={!bookId || !readerId}>
      <div className="sm:col-span-2">
        <FormCombobox
          label="Obra *"
          value={bookId}
          onValueChange={setBookId}
          searchPlaceholder="Pesquisar obra..."
          options={allBooks.filter((b) => b.is_active && b.copies_available > 0).map((b) => ({ value: b.id, label: b.title, hint: `${b.author} · ${b.copies_available} disponíveis` }))}
        />
      </div>
      <div className="sm:col-span-2 flex gap-2">
        <Button type="button" size="sm" variant={kind === "student" ? "default" : "outline"} onClick={() => { setKind("student"); setReaderId(""); }}>Aluno</Button>
        <Button type="button" size="sm" variant={kind === "teacher" ? "default" : "outline"} onClick={() => { setKind("teacher"); setReaderId(""); }}>Professor</Button>
      </div>
      <div className="sm:col-span-2">
        <FormCombobox label="Leitor *" value={readerId} onValueChange={setReaderId} options={readers} searchPlaceholder="Pesquisar por nome..." />
      </div>
    </FormModal>
  );
}
