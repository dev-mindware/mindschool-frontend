"use client";

import { MED_MAP_LABEL, MED_STATUS_LABEL } from "@/constants/labels";
import { useState } from "react";
import { z } from "zod";
import { SucessMessage, ErrorMessage } from "@/utils/messages";
import { useQuery } from "@tanstack/react-query";
import { Can, Badge, Button, ButtonOnlyAction, DataList, FormModal, FormSelect, Icon, Input, TitleList, type Column } from "@/components";
import { MedMapType, MedSnapshot, useMedSnapshots } from "@/hooks/school/use-med-snapshots";
import { useGradeTerms } from "@/hooks/school/use-grades";
import { academicService } from "@/services/academic-service";
import { safeTextSchema, stripControlChars } from "@/schemas/helps";
import { useModal } from "@/stores/modal/use-modal-store";
import { getApiErrorMessage } from "@/utils/api-error";
import { formatIsoDay } from "@/utils/format-date";

const medGenerateSchema = z
  .object({
    map_type: z.enum(["matriculas", "aproveitamento"]),
    term_id: z.string().trim().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.map_type === "aproveitamento" && !data.term_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["term_id"],
        message: "Seleccione um período para o mapa de aproveitamento.",
      });
    }
  });

const medSubmissionReferenceSchema = safeTextSchema(3, 80, "O protocolo / referência");


/** Mapas estatisticos oficiais do MED a partir de instantaneos imutaveis (nunca recalculados ao vivo). */
export function MedSnapshotsContent() {
  const { snapshots, isLoading, create, validate, approve, submit, exportFile } = useMedSnapshots();
  const { data: terms = [] } = useGradeTerms();
  const { data: year } = useQuery({ queryKey: ["active-year"], queryFn: academicService.activeYear, staleTime: 5 * 60 * 1000 });
  const { openModal } = useModal();
  const [mapType, setMapType] = useState<MedMapType>("matriculas");
  const [termId, setTermId] = useState("");
  const [submitting, setSubmitting] = useState<MedSnapshot | null>(null);
  const [reference, setReference] = useState("");
  const [referenceTouched, setReferenceTouched] = useState(false);

  const effectiveTermId = termId || terms[terms.length - 1]?.id || "";
  const generateResult = medGenerateSchema.safeParse({ map_type: mapType, term_id: effectiveTermId });
  const generateTermError = !generateResult.success
    ? generateResult.error.issues.find((i) => i.path[0] === "term_id")?.message
    : undefined;
  const referenceResult = medSubmissionReferenceSchema.safeParse(reference);
  const referenceError = (referenceTouched || reference.length > 0) && !referenceResult.success
    ? referenceResult.error.issues[0]?.message
    : undefined;

  const run = (p: Promise<unknown>, ok: string) => p.then(() => SucessMessage(ok)).catch((e) => ErrorMessage(getApiErrorMessage(e, "A operação falhou.")));

  const generate = () => {
    if (!year) { ErrorMessage("Não há ano letivo ativo."); throw new Error("no-year"); }
    if (!generateResult.success) { ErrorMessage(generateTermError ?? "Dados inválidos."); throw new Error("invalid-form"); }
    return create.mutateAsync({
      academic_year_id: year.id,
      map_type: generateResult.data.map_type,
      ...(generateResult.data.map_type === "aproveitamento" ? { term_id: generateResult.data.term_id } : {}),
    }).then(() => { SucessMessage("Instantâneo gerado."); });
  };

  const columns: Column<MedSnapshot>[] = [
    { key: "map_type", header: "Mapa", render: (_, s) => (<div><div className="text-sm font-semibold">{MED_MAP_LABEL[s.map_type]} · v{s.version}</div><div className="text-xs text-muted-foreground">código de integridade {s.checksum.slice(0, 10)}…</div></div>) },
    { key: "created_at", header: "Gerado em", render: (_, s) => <span className="text-xs">{formatIsoDay(s.created_at)}</span> },
    { key: "status", header: "Estado", render: (_, s) => <Badge variant="outline">{MED_STATUS_LABEL[s.status]}</Badge> },
    {
      key: "issues",
      header: "Verificações",
      render: (_, s) => {
        const blocking = s.issues.filter((i) => i.severity === "blocking").length;
        const warn = s.issues.length - blocking;
        return s.issues.length === 0 ? <Badge variant="success">Sem pendências</Badge> : (
          <details className="text-xs">
            <summary className="cursor-pointer">{blocking > 0 && <span className="text-destructive">{blocking} bloqueante(s) </span>}{warn > 0 && <span className="text-warning">{warn} aviso(s)</span>}</summary>
            <ul className="mt-1 max-w-xs list-disc space-y-0.5 pl-4 text-muted-foreground">
              {s.issues.slice(0, 8).map((i, n) => <li key={n} className={i.severity === "blocking" ? "text-destructive" : undefined}>{i.message}</li>)}
              {s.issues.length > 8 && <li>… e mais {s.issues.length - 8}</li>}
            </ul>
          </details>
        );
      },
    },
    { key: "submission_reference", header: "Protocolo", render: (_, s) => <span className="font-mono text-xs">{s.submission_reference ?? "—"}</span> },
    {
      key: "actions",
      header: "Ação",
      render: (_, s) => {
        const blocking = s.issues.filter((i) => i.severity === "blocking").length;
        return (
          <ButtonOnlyAction
            data={s}
            actions={[
              ...(s.status === "gerado" ? [{ permission: "report:med_snapshot", label: "Validar", icon: "ShieldCheck" as const, onClick: (x: MedSnapshot) => void run(validate.mutateAsync(x.id), "Validação concluída.") }] : []),
              ...(s.status === "validado" && blocking === 0 ? [{ permission: "report:med_approve", label: "Aprovar", icon: "Check" as const, onClick: (x: MedSnapshot) => void run(approve.mutateAsync(x.id), "Mapa aprovado.") }] : []),
              ...(["aprovado", "exportado", "submetido"].includes(s.status)
                ? [
                    { label: "Exportar Excel", icon: "FileSpreadsheet" as const, onClick: (x: MedSnapshot) => void run(exportFile.mutateAsync({ id: x.id, format: "xlsx" }), "Exportado em Excel.") },
                    { label: "Exportar CSV", icon: "FileText" as const, onClick: (x: MedSnapshot) => void run(exportFile.mutateAsync({ id: x.id, format: "csv" }), "Exportado em CSV.") },
                  ]
                : []),
              ...(s.status === "exportado" ? [{ permission: "report:med_approve", label: "Registar submissão", icon: "Send" as const, onClick: (x: MedSnapshot) => { setSubmitting(x); setReference(""); setReferenceTouched(false); openModal("med-submit"); } }] : []),
            ]}
          />
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <TitleList title="Mapas Estatísticos Oficiais (MED)" suTitle="Mapas estatísticos oficiais de aproveitamento (MED).">
        <Can permission="report:med_snapshot"><Button size="sm" className="gap-2" onClick={() => openModal("med-generate")}>
          <Icon name="FilePlus" className="size-4" />
          Gerar instantâneo
        </Button></Can>
      </TitleList>

      <DataList<MedSnapshot>
        prefix="med"
        rows={snapshots}
        columns={columns}
        isLoading={isLoading}
        pageSize={10}
        searchPlaceholder="Pesquisar por mapa ou protocolo"
        searchText={(s) => `${MED_MAP_LABEL[s.map_type]} ${s.submission_reference ?? ""} ${s.checksum}`}
        filters={[
          { key: "map_type", label: "Mapa", icon: "Map", options: [{ value: "matriculas", label: "Matrículas" }, { value: "aproveitamento", label: "Aproveitamento" }], match: (s, v) => s.map_type === v },
          { key: "status", label: "Estado", icon: "ListFilter", options: Object.entries(MED_STATUS_LABEL).map(([value, label]) => ({ value, label })), match: (s, v) => s.status === v },
          { key: "issues", label: "Verificações", icon: "TriangleAlert", options: [{ value: "blocking", label: "Com bloqueantes" }, { value: "warnings", label: "Só avisos" }, { value: "clean", label: "Sem pendências" }], match: (s, v) => { const b = s.issues.filter((i) => i.severity === "blocking").length; return v === "blocking" ? b > 0 : v === "warnings" ? b === 0 && s.issues.length > 0 : s.issues.length === 0; } },
        ]}
        dateFilters={[{ key: "generated", label: "Geração", getDate: (s) => s.created_at }]}
        sorts={[
          { value: "date", label: "Data de geração", compare: (a, b) => a.created_at.localeCompare(b.created_at) },
          { value: "version", label: "Versão", compare: (a, b) => a.version - b.version },
        ]}
        emptyTitle="Ainda não há instantâneos"
        emptyDescription="Gere o primeiro mapa estatístico."
        emptyIcon="Map"
      />

      <FormModal id="med-generate" title="Gerar instantâneo" description="Cria um corte imutável dos dados da escola para o mapa escolhido. O «Aproveitamento» exige a pauta do período fechada; antes de aprovar, veja nas «Verificações» o que falta corrigir (ex.: pautas por fechar, escola sem código MED, alunos sem sexo). Para atualizar os dados gera-se um instantâneo novo (nova versão)." submitLabel="Gerar" isLoading={create.isPending} disabled={!year || !generateResult.success || create.isPending} onSubmit={generate}>
        <div className="sm:col-span-2"><FormSelect label="Mapa" value={mapType} onValueChange={(v) => setMapType(v as MedMapType)} options={[{ value: "matriculas", label: "Matrículas" }, { value: "aproveitamento", label: "Aproveitamento" }]} /></div>
        {mapType === "aproveitamento" && (
          <div className="sm:col-span-2"><FormSelect label="Período do corte" value={termId} onValueChange={setTermId} error={generateTermError} placeholder="Último período" options={terms.map((t) => ({ value: t.id, label: `${t.sequence}.º Trimestre` }))} /></div>
        )}
      </FormModal>

      <FormModal
        id="med-submit"
        title="Registar submissão ao MED"
        description="Só guarda o protocolo que o Ministério lhe deu depois de entregar o mapa: o sistema não envia nada ao MED."
        submitLabel="Registar"
        isLoading={submit.isPending}
        disabled={!referenceResult.success || submit.isPending}
        onSubmit={() => {
          setReferenceTouched(true);
          if (!submitting || !referenceResult.success) return;
          return submit.mutateAsync({ id: submitting.id, reference: referenceResult.data }).then(() => { SucessMessage("Submissão registada."); }).catch((e) => { ErrorMessage(getApiErrorMessage(e, "A operação falhou.")); throw e; });
        }}
      >
        <div className="sm:col-span-2">
          <Input
            label="Protocolo / referência *"
            maxLength={80}
            value={reference}
            error={referenceError}
            onChange={(e) => { setReference(stripControlChars(e.target.value)); setReferenceTouched(true); }}
            placeholder="Ex.: PROT-MED/2026/8492"
          />
        </div>
      </FormModal>
    </div>
  );
}
