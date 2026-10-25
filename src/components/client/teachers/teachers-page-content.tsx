"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { SucessMessage, ErrorMessage } from "@/utils/messages";
import { Can, Badge, Button, ButtonOnlyAction, DataList, EmptyState, FormCombobox, FormModal, Icon, Input, PrintDownloadDropdown, TitleList, type Column } from "@/components";
import { useTeacherCredentials, useTeachersAdmin } from "@/hooks/school/use-admin-school";
import type { ApiTeacherFull, TeacherStatus } from "@/services/admin-school-service";
import { useSchoolSettingsStore } from "@/stores/school/school-settings-store";
import { useModal } from "@/stores/modal/use-modal-store";
import { getApiErrorMessage } from "@/utils/api-error";

const fail = (e: unknown) => { ErrorMessage(getApiErrorMessage(e, "A operação falhou.")); throw e; };
const STATUS: Record<TeacherStatus, string> = { activo: "Ativo", licenca: "Em licença", desvinculado: "Desvinculado" };

function CardPreview({ payload, name }: { payload: string; name: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const { profile } = useSchoolSettingsStore();
  useEffect(() => { if (ref.current) void QRCode.toCanvas(ref.current, payload, { width: 180, margin: 1 }); }, [payload]);
  return (
    <div className="mx-auto w-64 space-y-2 rounded-xl border-2 border-primary/40 bg-white p-4 text-center text-slate-900">
      <p className="text-[10px] font-bold uppercase tracking-widest">{profile.schoolName}</p>
      <canvas ref={ref} className="mx-auto" />
      <p className="text-sm font-semibold">{name}</p>
      <p className="text-[10px] text-slate-500">Cartão de ponto docente</p>
    </div>
  );
}

function NewTeacherModal() {
  const t = useTeachersAdmin();
  const [userId, setUserId] = useState("");
  const [doc, setDoc] = useState("");
  const [qual, setQual] = useState("");
  const submit = () => t.create.mutateAsync({ userId, documentNumber: doc.trim(), qualification: qual.trim() || undefined }).then(() => { SucessMessage("Ficha criada."); setUserId(""); setDoc(""); setQual(""); }).catch(fail);

  return (
    <FormModal id="teachers-new" title="Nova ficha de professor" description="Primeiro adicione o utilizador com o papel de professor (Definições → Utilizadores e Papéis) e depois crie a ficha." submitLabel="Criar ficha" isLoading={t.create.isPending} onSubmit={submit} disabled={!userId || doc.trim().length < 5}>
      <div className="sm:col-span-2">
        <FormCombobox label="Utilizador (professor sem ficha) *" value={userId} onValueChange={setUserId} options={t.candidates.map((m) => ({ value: m.user.id, label: m.user.full_name, hint: m.user.email }))} />
      </div>
      <Input label="N.º do documento *" startIcon="IdCard" value={doc} onChange={(e) => setDoc(e.target.value)} />
      <Input label="Habilitação académica" startIcon="GraduationCap" value={qual} onChange={(e) => setQual(e.target.value)} />
    </FormModal>
  );
}

function CredentialsModal({ teacher }: { teacher: ApiTeacherFull | null }) {
  const { credentials, issue, block } = useTeacherCredentials(teacher?.id);
  const { openModal } = useModal();
  const [card, setCard] = useState<string | null>(null);
  const [blockId, setBlockId] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  useEffect(() => setCard(null), [teacher?.id]);

  return (
    <>
      <FormModal id="teachers-credentials" title={`Credenciais de ponto — ${teacher?.full_name ?? ""}`} description="O cartão físico só é mostrado uma vez: imprima-o logo após a emissão." size="lg" readOnly onSubmit={() => undefined}>
        <div className="sm:col-span-2 space-y-4 text-sm">
          <Can permission="attendance:write" fallback={<p className="text-xs text-muted-foreground">A emissão de credenciais é feita pela Direção Pedagógica.</p>}>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" disabled={issue.isPending} onClick={() => issue.mutateAsync("cartao_fisico").then((c) => { setCard(c.qr_payload ?? null); SucessMessage("Cartão emitido."); }).catch(fail)}>Emitir cartão físico</Button>
            <Button size="sm" variant="outline" disabled={issue.isPending} onClick={() => issue.mutateAsync("app_dinamico").then(() => SucessMessage("Credencial da aplicação emitida.")).catch(fail)}>Emitir QR da aplicação</Button>
          </div>
          </Can>
          {card && teacher && (
            <div className="space-y-2">
              <div id="teacher-card-container">
                <CardPreview payload={card} name={teacher.full_name} />
              </div>
              <div className="flex justify-center">
                <PrintDownloadDropdown
                  elementId="teacher-card-container"
                  filename={`Cartao_${teacher.full_name.replace(/\s+/g, "_")}.pdf`}
                  label="Baixar Cartão (PDF)"
                />
              </div>
            </div>
          )}
          {credentials.length === 0 && <p className="text-muted-foreground">Sem credenciais emitidas.</p>}
          {credentials.map((c) => (
            <div key={c.id} className="flex items-center justify-between rounded-lg border p-2">
              <span>{c.credential_type === "cartao_fisico" ? "Cartão físico" : "QR da aplicação"} • {c.issued_at.slice(0, 10)}</span>
              <span className="flex items-center gap-2">
                <Badge variant="outline">{c.status}</Badge>
                {c.status === "activa" && <Button size="sm" variant="ghost" className="h-7 text-xs text-destructive" onClick={() => { setBlockId(c.id); setReason(""); openModal("teachers-block-credential"); }}>Bloquear</Button>}
              </span>
            </div>
          ))}
        </div>
      </FormModal>
      <FormModal id="teachers-block-credential" title="Bloquear credencial" description="Indique o motivo (mínimo 5 caracteres). A credencial deixa de ser aceite de imediato." submitLabel="Bloquear" isLoading={block.isPending} disabled={reason.trim().length < 5} onSubmit={() => (blockId ? block.mutateAsync({ id: blockId, reason: reason.trim() }).then(() => SucessMessage("Credencial bloqueada.")).catch(fail) : undefined)}>
        <div className="sm:col-span-2"><Input label="Motivo *" value={reason} onChange={(e) => setReason(e.target.value)} /></div>
      </FormModal>
    </>
  );
}

/** Corpo docente: ficha do professor (liga um utilizador com papel de professor), estado e credenciais de ponto por QR. */
export function TeachersPageContent() {
  const t = useTeachersAdmin();
  const { openModal } = useModal();
  const [creds, setCreds] = useState<ApiTeacherFull | null>(null);

  if (t.forbidden) return <EmptyState icon="Lock" title="Sem acesso" description="O seu perfil não gere o corpo docente." />;

  const setStatus = (x: ApiTeacherFull, status: TeacherStatus) => t.update.mutateAsync({ id: x.id, status }).then(() => SucessMessage("Estado atualizado.")).catch((e) => ErrorMessage(getApiErrorMessage(e, "A operação falhou.")));

  const columns: Column<ApiTeacherFull>[] = [
    { key: "full_name", header: "Professor", render: (_, x) => (<div className="flex flex-col"><span className="font-medium">{x.full_name}</span><span className="text-xs text-muted-foreground">{x.email}</span></div>) },
    { key: "document_number", header: "Documento", render: (_, x) => <span className="font-mono text-xs">{x.document_number}</span> },
    { key: "academic_qualification", header: "Habilitação", render: (_, x) => x.academic_qualification ?? "—" },
    { key: "status", header: "Estado", render: (_, x) => <Badge variant={x.status === "activo" ? "outline" : "secondary"} className={x.status === "activo" ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700" : ""}>{STATUS[x.status]}</Badge> },
    {
      key: "action", header: "Ação",
      render: (_, x) => (
        <ButtonOnlyAction data={x} actions={[
          { label: "Credenciais QR", icon: "QrCode", onClick: (r) => { setCreds(r); openModal("teachers-credentials"); } },
          ...(x.status !== "activo" ? [{ permission: "teacher:write", label: "Marcar como ativo", icon: "CircleCheck" as const, onClick: (r: ApiTeacherFull) => void setStatus(r, "activo") }] : []),
          ...(x.status !== "licenca" ? [{ permission: "teacher:write", label: "Colocar em licença", icon: "Clock" as const, onClick: (r: ApiTeacherFull) => void setStatus(r, "licenca") }] : []),
          ...(x.status !== "desvinculado" ? [{ permission: "teacher:write", label: "Desvincular", icon: "UserX" as const, variant: "destructive" as const, onClick: (r: ApiTeacherFull) => void setStatus(r, "desvinculado") }] : []),
        ]} />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <TitleList title="Corpo Docente" suTitle="Fichas dos professores, estado e credenciais de ponto por QR.">
        <Can permission="teacher:write"><Button size="sm" className="gap-2" onClick={() => openModal("teachers-new")}><Icon name="UserPlus" className="size-4" />Nova ficha</Button></Can>
      </TitleList>

      <DataList<ApiTeacherFull>
        prefix="docentes"
        rows={t.teachers}
        columns={columns}
        isLoading={t.isLoading}
        searchPlaceholder="Pesquisar por nome, e-mail ou documento"
        searchText={(x) => `${x.full_name} ${x.email ?? ""} ${x.document_number}`}
        filters={[
          { key: "estado", label: "Estado", icon: "Tag", options: (Object.keys(STATUS) as TeacherStatus[]).map((s) => ({ value: s, label: STATUS[s] })), match: (x, v) => x.status === v },
          { key: "habilitacao", label: "Habilitação", icon: "GraduationCap", options: [{ value: "com", label: "Com habilitação" }, { value: "sem", label: "Sem habilitação" }], match: (x, v) => (v === "com" ? Boolean(x.academic_qualification) : !x.academic_qualification) },
        ]}
        sorts={[
          { value: "nome", label: "Nome", compare: (a, b) => a.full_name.localeCompare(b.full_name) },
          { value: "estado", label: "Estado", compare: (a, b) => a.status.localeCompare(b.status) },
        ]}
        emptyTitle="Sem professores"
        emptyDescription="Um professor precisa de duas coisas: a conta de acesso (Definições › Utilizadores e Papéis, papel «Professor») e a ficha de docente. Crie a ficha em «Nova ficha» escolhendo o utilizador que convidou."
        emptyIcon="GraduationCap"
      />

      <NewTeacherModal />
      <CredentialsModal teacher={creds} />
    </div>
  );
}
