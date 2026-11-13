"use client";

import { useMemo, useState } from "react";
import { z } from "zod";
import { SucessMessage } from "@/utils/messages";
import {
  currencySchema,
  optionalSafeTextSchema,
  quantitySchema,
  safeTextSchema,
  stripControlChars,
} from "@/schemas/helps";
import {
  Badge,
  Button,
  ButtonOnlyAction,
  ConfirmModal,
  DataList,
  FeatureGate,
  FormModal,
  FormSelect,
  Icon,
  Input,
  InputCurrency,
  Textarea,
  type Column,
} from "@/components";
import { useTuition } from "@/modules/finance/hooks/use-tuition";
import { useModal } from "@/stores/modal/use-modal-store";
import { formatCurrency } from "@/utils/format-currency";
import type { CustomEmolument } from "@/modules/finance/types";

const MODAL_NEW = "emolument-form";
const MODAL_DELETE = "emolument-delete";

const emolumentFormSchema = z.object({
  name: safeTextSchema(2, 120, "O nome do emolumento"),
  code: z
    .string()
    .transform((v) => stripControlChars(v).trim().toUpperCase())
    .refine(
      (v) => v === "" || /^[A-Z0-9_-]{2,40}$/.test(v),
      "O código deve ter entre 2 e 40 caracteres (letras, números, '_' ou '-')."
    ),
  price: currencySchema(0, 10_000_000, "O preço"),
  deliveryDays: quantitySchema(0, 60, "O prazo de entrega"),
  description: optionalSafeTextSchema(255, 2, "A descrição"),
  active: z.enum(["true", "false"]),
});

type EmolumentField = "name" | "code" | "price" | "deliveryDays" | "description" | "active";

const DEFAULT_EMOLUMENTS: CustomEmolument[] = [
  {
    id: "emol-1",
    code: "DECL_NOTAS",
    name: "Declaração com Notas",
    price: 3500,
    deliveryDays: 3,
    requiresPayment: true,
    description: "Declaração descritiva de notas para efeitos de transferência ou concurso.",
    active: true,
  },
  {
    id: "emol-2",
    code: "DECL_FREQ",
    name: "Declaração de Frequência",
    price: 2000,
    deliveryDays: 2,
    requiresPayment: true,
    description: "Comprovativo de frequência letiva do aluno.",
    active: true,
  },
  {
    id: "emol-3",
    code: "CERT_HAB",
    name: "Certificado de Habilitações Literárias",
    price: 7500,
    deliveryDays: 5,
    requiresPayment: true,
    description: "Certificado oficial de conclusão de ciclo/ano letivo.",
    active: true,
  },
  {
    id: "emol-4",
    code: "CARTAO_2VIA",
    name: "Segunda Via do Cartão de Estudante",
    price: 3000,
    deliveryDays: 2,
    requiresPayment: true,
    description: "Emissão de novo cartão físico em caso de perda ou extravio.",
    active: true,
  },
];

/** Gestão dos Emolumentos próprios da escola: preços, prazos de emissão e taxas associadas. */
export function CustomEmolumentsSection() {
  const { plans, savePolicy } = useTuition();
  const { openModal } = useModal();
  const policy = plans[0];

  const emoluments: CustomEmolument[] =
    policy?.customEmoluments && policy.customEmoluments.length > 0
      ? policy.customEmoluments
      : DEFAULT_EMOLUMENTS;

  const [editing, setEditing] = useState<CustomEmolument | null>(null);
  const [deleting, setDeleting] = useState<CustomEmolument | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [deliveryDays, setDeliveryDays] = useState<string>("3");
  const [description, setDescription] = useState("");
  const [active, setActive] = useState<string>("true");
  const [touched, setTouched] = useState<Partial<Record<EmolumentField, boolean>>>({});

  const touch = (field: EmolumentField) =>
    setTouched((prev) => (prev[field] ? prev : { ...prev, [field]: true }));

  const parsed = useMemo(
    () =>
      emolumentFormSchema.safeParse({
        name,
        code,
        price,
        deliveryDays,
        description,
        active,
      }),
    [name, code, price, deliveryDays, description, active],
  );

  const fieldErrors = useMemo(() => {
    if (parsed.success) return {} as Partial<Record<EmolumentField, string>>;
    const map: Partial<Record<EmolumentField, string>> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as EmolumentField | undefined;
      if (key && !map[key]) map[key] = issue.message;
    }
    return map;
  }, [parsed]);

  const errorOf = (field: EmolumentField) => (touched[field] ? fieldErrors[field] : undefined);

  const openNew = () => {
    setEditing(null);
    setName("");
    setCode("");
    setPrice(2500);
    setDeliveryDays("3");
    setDescription("");
    setActive("true");
    setTouched({});
    openModal(MODAL_NEW);
  };

  const openEdit = (item: CustomEmolument) => {
    setEditing(item);
    setName(item.name);
    setCode(item.code);
    setPrice(item.price);
    setDeliveryDays(String(item.deliveryDays));
    setDescription(item.description ?? "");
    setActive(item.active ? "true" : "false");
    setTouched({});
    openModal(MODAL_NEW);
  };

  const save = async () => {
    if (!parsed.success) {
      setTouched({ name: true, code: true, price: true, deliveryDays: true, description: true, active: true });
      throw new Error("Formulário inválido.");
    }
    const data = parsed.data;
    const resolvedCode = data.code || `EMOL_${Date.now().toString().slice(-4)}`;
    const updated: CustomEmolument[] = editing
      ? emoluments.map((e) =>
          e.id === editing.id
            ? {
                ...e,
                name: data.name,
                code: resolvedCode,
                price: data.price,
                deliveryDays: data.deliveryDays,
                description: data.description || undefined,
                active: data.active === "true",
              }
            : e,
        )
      : [
          ...emoluments,
          {
            id: `emol-${Date.now()}`,
            name: data.name,
            code: resolvedCode,
            price: data.price,
            deliveryDays: data.deliveryDays,
            requiresPayment: true,
            description: data.description || undefined,
            active: data.active === "true",
          },
        ];

    await savePolicy.mutateAsync({
      monthlyAmount: policy?.monthlyAmount ?? 0,
      registrationFee: policy?.registrationFee ?? 0,
      dueStartDay: policy?.dueStartDay ?? 1,
      dueDay: policy?.dueDay ?? 20,
      graceDays: policy?.penaltyGracePeriodDays ?? 2,
      latePenaltyType: policy?.latePenaltyType ?? "percentage",
      latePenaltyValue: policy?.latePenaltyValue ?? policy?.latePenaltyPercent ?? 0,
      monthlyIncreaseType: policy?.monthlyIncreaseType ?? "percentage",
      monthlyIncreaseValue: policy?.monthlyIncreaseValue ?? 0,
      customEmoluments: updated,
      emailCollections: policy?.emailCollections,
    });
    SucessMessage(editing ? "Emolumento atualizado." : "Emolumento criado com sucesso.");
  };

  const remove = async (id: string) => {
    const updated = emoluments.filter((e) => e.id !== id);
    await savePolicy.mutateAsync({
      monthlyAmount: policy?.monthlyAmount ?? 0,
      registrationFee: policy?.registrationFee ?? 0,
      dueStartDay: policy?.dueStartDay ?? 1,
      dueDay: policy?.dueDay ?? 20,
      graceDays: policy?.penaltyGracePeriodDays ?? 2,
      latePenaltyType: policy?.latePenaltyType ?? "percentage",
      latePenaltyValue: policy?.latePenaltyValue ?? policy?.latePenaltyPercent ?? 0,
      monthlyIncreaseType: policy?.monthlyIncreaseType ?? "percentage",
      monthlyIncreaseValue: policy?.monthlyIncreaseValue ?? 0,
      customEmoluments: updated,
      emailCollections: policy?.emailCollections,
    });
    SucessMessage("Emolumento removido.");
  };

  const columns: Column<CustomEmolument>[] = [
    {
      key: "name",
      header: "Emolumento / Serviço",
      render: (_, item) => (
        <div>
          <p className="font-medium text-foreground">{item.name}</p>
          <p className="text-[11px] font-mono text-muted-foreground">{item.code}</p>
        </div>
      ),
    },
    {
      key: "price",
      header: "Preço",
      render: (_, item) => (
        <span className="font-semibold tabular-nums text-foreground">
          {item.price > 0 ? formatCurrency(item.price) : <Badge variant="secondary">Gratuito</Badge>}
        </span>
      ),
    },
    {
      key: "deliveryDays",
      header: "Prazo de Entrega",
      render: (_, item) => (
        <span className="text-xs text-muted-foreground">
          {item.deliveryDays > 0 ? `${item.deliveryDays} dia(s) úteis` : "Imediato"}
        </span>
      ),
    },
    {
      key: "active",
      header: "Estado",
      render: (_, item) => (
        <Badge variant={item.active ? "success" : "secondary"}>
          {item.active ? "Ativo" : "Inactivo"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Ações",
      render: (_, item) => (
        <div className="flex items-center gap-1">
          <ButtonOnlyAction
            data={item}
            actions={[
              {
                label: "Editar emolumento",
                icon: "Pencil",
                onClick: () => openEdit(item),
              },
              {
                label: "Eliminar",
                icon: "Trash2",
                variant: "destructive",
                onClick: () => {
                  setDeleting(item);
                  openModal(MODAL_DELETE);
                },
              },
            ]}
          />
        </div>
      ),
    },
  ];

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold">Tabela de Emolumentos & Serviços Escolares</h3>
          <p className="text-xs text-muted-foreground">
            Defina os preços em Kwanzas (Kz) e os prazos de entrega para os documentos e serviços solicitados por alunos e encarregados.
          </p>
        </div>
        <FeatureGate permission="school:update" fallback="disabled" tooltipMessage="Apenas a direção pode gerir emolumentos.">
          <Button size="sm" onClick={openNew} className="gap-2 text-xs font-semibold">
            <Icon name="Plus" className="size-4" />
            Novo emolumento
          </Button>
        </FeatureGate>
      </div>

      <DataList<CustomEmolument>
        prefix="fees"
        rows={emoluments}
        columns={columns}
        pageSize={10}
        searchPlaceholder="Pesquisar emolumento..."
        searchText={(e) => `${e.name} ${e.code}`}
        emptyTitle="Nenhum emolumento registado"
        emptyDescription="Crie os emolumentos da escola para cobrar declarações, cartões e certificados."
        emptyIcon="FileSpreadsheet"
      />

      {/* Modal de Formulário com InputCurrency */}
      <FormModal
        id={MODAL_NEW}
        title={editing ? "Editar Emolumento" : "Novo Emolumento Escolar"}
        description="Configure o valor a cobrar e o prazo de entrega em dias úteis."
        submitLabel={editing ? "Guardar alterações" : "Criar emolumento"}
        isLoading={savePolicy.isPending}
        disabled={!parsed.success || savePolicy.isPending}
        size="md"
        onSubmit={save}
      >
        <div className="grid grid-cols-1 gap-4 sm:col-span-2">
          <Input
            label="Nome do Emolumento *"
            value={name}
            maxLength={120}
            onChange={(e) => {
              touch("name");
              setName(e.target.value);
            }}
            error={errorOf("name")}
            placeholder="Ex.: Certificado com Notas - Ensino Primário"
          />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input
              label="Código Identificador"
              value={code}
              maxLength={40}
              onChange={(e) => {
                touch("code");
                setCode(e.target.value);
              }}
              error={errorOf("code")}
              placeholder="Ex.: CERT_PRIMARIO"
            />
            <FormSelect
              label="Estado"
              value={active}
              onValueChange={(v) => {
                touch("active");
                setActive(v);
              }}
              error={errorOf("active")}
              options={[
                { value: "true", label: "Ativo (disponível para cobrança)" },
                { value: "false", label: "Inactivo" },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <InputCurrency
                label="Preço em Kwanzas (Kz) *"
                currency="Kz"
                value={price}
                onValueChange={(val) => {
                  touch("price");
                  setPrice(val);
                }}
                error={errorOf("price")}
                aria-invalid={Boolean(errorOf("price")) || undefined}
                placeholder="0 Kz"
              />
            </div>
            <Input
              label="Prazo de Entrega (dias úteis)"
              type="number"
              min={0}
              max={60}
              step={1}
              value={deliveryDays}
              onChange={(e) => {
                touch("deliveryDays");
                setDeliveryDays(e.target.value);
              }}
              error={errorOf("deliveryDays")}
              placeholder="3"
            />
          </div>

          <Textarea
            label="Descrição / Observações (opcional)"
            value={description}
            maxLength={255}
            onChange={(e) => {
              touch("description");
              setDescription(e.target.value);
            }}
            error={errorOf("description")}
            placeholder="Informações adicionais para a secretaria ou orientações para a emissão..."
            rows={3}
          />
        </div>
      </FormModal>

      {/* Modal de Confirmação de Eliminação */}
      <ConfirmModal
        id={MODAL_DELETE}
        title="Eliminar emolumento"
        description={deleting ? `Tem certeza de que pretende eliminar o emolumento "${deleting.name}"?` : ""}
        destructive
        confirmLabel="Eliminar"
        isLoading={savePolicy.isPending}
        onConfirm={() => (deleting ? remove(deleting.id) : Promise.resolve())}
      />
    </section>
  );
}
