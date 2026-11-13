"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import QRCode from "qrcode";
import { SucessMessage, ErrorMessage } from "@/utils/messages";
import { formatIsoDay } from "@/utils";
import { Can, Badge, Button, ButtonOnlyAction, DataList, EmptyState, FormCombobox, FormModal, FormTextarea, Icon, Input, PrintDownloadDropdown, TitleList, type Column } from "@/components";
import { useTeacherCredentials, useTeachersAdmin } from "@/hooks/school/use-admin-school";
import type { ApiTeacherFull, TeacherStatus } from "@/services/admin-school-service";
import { useSchoolSettingsStore } from "@/stores/school/school-settings-store";
import { useModal } from "@/stores/modal/use-modal-store";
import { applyApiFieldErrors, getApiErrorMessage } from "@/utils/api-error";
import { formalReasonSchema, newTeacherSchema, type NewTeacherFormData } from "@/schemas";
import type { z } from "zod";

const fail = (e: unknown) => { ErrorMessage(getApiErrorMessage(e, "A operação falhou.")); throw e; };
const STATUS: Record<TeacherStatus, string> = { activo: "Ativo", licenca: "Em licença", desvinculado: "Desvinculado" };

/** Linha da lista: ficha de professor ou utilizador «professor» que ainda não tem ficha (`noProfile`). */
type TeacherRow = ApiTeacherFull & { noProfile?: boolean };

function StatusBadge({ x }: { x: TeacherRow }) {
  if (x.noProfile) return <Badge variant="warning">Sem ficha</Badge>;
  // convite enviado e nunca usado: a ficha existe mas o professor ainda não entrou
  if (x.status === "activo" && x.invite_pending) return <Badge variant="warning">Convite pendente</Badge>;
  return <Badge variant={x.status === "activo" ? "success" : "secondary"}>{STATUS[x.status]}</Badge>;
}

function CardPreview({ payload, name }: { payload: string; name: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const { profile } = useSchoolSettingsStore();
  useEffect(() => { if (ref.current) void QRCode.toCanvas(ref.current, payload, { width: 180, margin: 1 }); }, [payload]);
  return (
    <div className="mx-auto w-64 space-y-2 rounded-lg border-2 border-primary/40 bg-card p-4 text-center text-foreground">
      <p className="text-[10px] font-semibold uppercase tracking-widest">{profile.schoolName}</p>
      <canvas ref={ref} className="mx-auto rounded-sm bg-white p-1" />
      <p className="text-sm font-semibold">{name}</p>
      <p className="text-[10px] text-muted-foreground">Cartão de ponto docente</p>
    </div>
  );
}

type NewTeacherInput = z.input<typeof newTeacherSchema>;

function NewTeacherModal() {
  const t = useTeachersAdmin();
  const {
    register,
    watch,
    setValue,
    setError,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<NewTeacherInput, unknown, NewTeacherFormData>({
    resolver: zodResolver(newTeacherSchema),
    mode: "onChange",
    defaultValues: { userId: "", documentNumber: "", qualification: "" },
  });

  const userId = watch("userId");

  const onSubmit = (data: NewTeacherFormData) =>
    t.create
      .mutateAsync({
        userId: data.userId,
        documentNumber: data.documentNumber,
        qualification: data.qualification || undefined,
      })
      .then(() => {
        SucessMessage("Ficha criada.");
        reset();
      })
      .catch((err) => {
        applyApiFieldErrors(err, setError, { document_number: "documentNumber" });
        fail(err);
      });

  return (
    <FormModal
      id="teachers-new"
      title="Nova ficha de professor"
      description="Primeiro adicione o utilizador com o papel de professor (Definições → Utilizadores e Papéis) e depois crie a ficha."
      submitLabel="Criar ficha"
      isLoading={t.create.isPending}
      onSubmit={handleSubmit(onSubmit)}
      onClose={() => reset()}
      disabled={!isValid || t.create.isPending}
    >
      <div className="sm:col-span-2">
        <FormCombobox
          label="Utilizador (professor sem ficha) *"
          value={userId}
          error={errors.userId?.message}
          onValueChange={(v) => setValue("userId", v, { shouldValidate: true })}
          options={t.candidates.map((m) => ({ value: m.user.id, label: m.user.full_name, hint: m.user.email }))}
        />
      </div>
      <Input
        label="N.º do documento (BI ou Passaporte) *"
        startIcon="IdCard"
        placeholder="Ex.: 007849302LA042"
        error={errors.documentNumber?.message}
        {...register("documentNumber")}
      />
      <Input
        label="Habilitação académica"
        startIcon="GraduationCap"
        placeholder="Ex.: Licenciatura em Matemática"
        error={errors.qualification?.message}
        {...register("qualification")}
      />
    </FormModal>
  );
}

const blockCredentialSchema = formalReasonSchema(5, 500, "O motivo do bloqueio");
type BlockCredentialFormData = z.infer<typeof blockCredentialSchema>;

function CredentialsModal({ teacher }: { teacher: ApiTeacherFull | null }) {
  const { credentials, issue, block } = useTeacherCredentials(teacher?.id);
  const { openModal } = useModal();
  const [card, setCard] = useState<string | null>(null);
  const [blockId, setBlockId] = useState<string | null>(null);
  const {
    watch: watchBlock,
    setValue: setBlockValue,
    setError: setBlockError,
    handleSubmit: handleBlockSubmit,
    reset: resetBlockForm,
    formState: { errors: blockErrors, isValid: isBlockValid },
  } = useForm<BlockCredentialFormData>({
    resolver: zodResolver(blockCredentialSchema),
    mode: "onChange",
    defaultValues: { reason: "" },
  });

  const blockReason = watchBlock("reason") ?? "";

  useEffect(() => setCard(null), [teacher?.id]);

  return (
    <>
      <FormModal id="teachers-credentials" title={`Credenciais de ponto — ${teacher?.full_name ?? ""}`} description="O cartão físico só é mostrado uma vez: imprima-o logo após a emissão." size="lg" readOnly onSubmit={() => undefined}>
        <div className="space-y-4 text-sm sm:col-span-2">
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
            <div key={c.id} className="flex items-center justify-between rounded-xs border p-2">
              <span>{c.credential_type === "cartao_fisico" ? "Cartão físico" : "QR da aplicação"} • {formatIsoDay(c.issued_at)}</span>
              <span className="flex items-center gap-2">
                <Badge variant="outline">{c.status}</Badge>
                {c.status === "activa" && <Button size="sm" variant="ghost" className="h-7 text-xs text-destructive" onClick={() => { setBlockId(c.id); resetBlockForm({ reason: "" }); openModal("teachers-block-credential"); }}>Bloquear</Button>}
              </span>
            </div>
          ))}
        </div>
      </FormModal>
      <FormModal
        id="teachers-block-credential"
        title="Bloquear credencial"
        description="Indique o motivo (mínimo 5 caracteres). A credencial deixa de ser aceite de imediato."
        submitLabel="Bloquear"
        isLoading={block.isPending}
        disabled={!isBlockValid || block.isPending}
        onClose={() => {
          resetBlockForm();
          setBlockId(null);
        }}
        onSubmit={handleBlockSubmit((data) =>
          blockId
            ? block.mutateAsync({ id: blockId, reason: data.reason }).then(() => {
                SucessMessage("Credencial bloqueada.");
                resetBlockForm();
                setBlockId(null);
              }).catch((err) => {
                applyApiFieldErrors(err, setBlockError);
                fail(err);
              })
            : undefined
        )}
      >
        <div className="sm:col-span-2">
          <FormTextarea
            label="Motivo do bloqueio *"
            placeholder="Ex.: Cartão físico extraviado, furto ou cessação de funções..."
            maxLength={500}
            value={blockReason}
            error={blockErrors.reason?.message}
            onChange={(val) =>
              setBlockValue("reason", val, {
                shouldValidate: true,
                shouldTouch: true,
                shouldDirty: true,
              })
            }
            rows={3}
          />
        </div>
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

  // Utilizadores com o papel «professor» sem ficha também aparecem (antes ficavam invisíveis até alguém criar a ficha).
  const rows: TeacherRow[] = [
    ...t.teachers,
    ...t.candidates.map((m): TeacherRow => ({
      id: `sem-ficha-${m.user.id}`, user_id: m.user.id, full_name: m.user.full_name, email: m.user.email, document_number: "—",
      academic_qualification: null, status: "activo", invite_pending: m.user.invite_pending, noProfile: true,
    })),
  ];

  const columns: Column<TeacherRow>[] = [
    { key: "full_name", header: "Professor", render: (_, x) => (<div className="flex flex-col"><span className="font-medium">{x.full_name}</span><span className="text-xs text-muted-foreground">{x.email}</span></div>) },
    { key: "document_number", header: "Documento", render: (_, x) => <span className="font-mono text-xs">{x.document_number}</span> },
    { key: "academic_qualification", header: "Habilitação", render: (_, x) => x.academic_qualification ?? "—" },
    { key: "status", header: "Estado", render: (_, x) => <StatusBadge x={x} /> },
    {
      key: "action", header: "Ação",
      render: (_, x) => x.noProfile ? (
        <Can permission="teacher:write"><Button size="sm" variant="outline" onClick={() => openModal("teachers-new")}>Criar ficha</Button></Can>
      ) : (
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

      <DataList<TeacherRow>
        prefix="teachers"
        rows={rows}
        columns={columns}
        isLoading={t.isLoading}
        searchPlaceholder="Pesquisar por nome, e-mail ou documento"
        searchText={(x) => `${x.full_name} ${x.email ?? ""} ${x.document_number}`}
        filters={[
          { key: "status", label: "Estado", icon: "Tag", options: [...(Object.keys(STATUS) as TeacherStatus[]).map((s) => ({ value: s, label: STATUS[s] })), { value: "invite_pending", label: "Convite pendente" }, { value: "no_profile", label: "Sem ficha" }], match: (x, v) => (v === "no_profile" ? Boolean(x.noProfile) : v === "invite_pending" ? Boolean(x.invite_pending) && !x.noProfile : !x.noProfile && x.status === v) },
          { key: "qualification", label: "Habilitação", icon: "GraduationCap", options: [{ value: "with", label: "Com habilitação" }, { value: "without", label: "Sem habilitação" }], match: (x, v) => (v === "with" ? Boolean(x.academic_qualification) : !x.academic_qualification) },
        ]}
        sorts={[
          { value: "name", label: "Nome", compare: (a, b) => a.full_name.localeCompare(b.full_name) },
          { value: "status", label: "Estado", compare: (a, b) => a.status.localeCompare(b.status) },
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
