"use client";

import React, { useMemo } from "react";
import { UseFormRegister, FieldErrors, UseFormSetValue } from "react-hook-form";
import { Button, Input, SelectField, Icon, Tabs, TabsList, TabsTrigger } from "@/components";
import { useGuardians } from "@/hooks/school/use-guardians";
import { StudentFormValues } from "./student-identification-fields";

interface StudentGuardianFieldsProps {
  register: UseFormRegister<StudentFormValues>;
  errors: FieldErrors<StudentFormValues>;
  selectedRelationship: string;
  guardianMode: "existing" | "new";
  selectedGuardianId?: string;
  setValue: UseFormSetValue<StudentFormValues>;
  isEditing?: boolean;
}

export function StudentGuardianFields({
  register,
  errors,
  selectedRelationship,
  guardianMode,
  selectedGuardianId,
  setValue,
  isEditing = false,
}: StudentGuardianFieldsProps) {
  const { allGuardians, isLoading } = useGuardians();

  const relationshipOptions = [
    { value: "Pai", label: "Pai" },
    { value: "Mãe", label: "Mãe" },
    { value: "Tio/Tia", label: "Tio(a)" },
    { value: "Avô/Avó", label: "Avô(ó)" },
    { value: "Tutor Legal", label: "Tutor Legal" },
    { value: "Outro", label: "Outro" },
  ];

  const guardianOptions = useMemo(() => {
    return allGuardians.map((g) => ({
      value: g.id,
      label: `${g.fullName} (${g.phonePrimary || "Sem tel."}${g.idDocumentNumber ? ` • ${g.idDocumentNumber}` : ""})`,
    }));
  }, [allGuardians]);

  const selectedGuardian = useMemo(() => {
    if (!selectedGuardianId) return null;
    return allGuardians.find((g) => g.id === selectedGuardianId) ?? null;
  }, [allGuardians, selectedGuardianId]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          2. Encarregado de Educação
        </h4>

        {!isEditing && (
          <Tabs
            value={guardianMode}
            onValueChange={(v) => setValue("guardianMode", v as "existing" | "new", { shouldValidate: true })}
          >
            <TabsList className="h-8">
              <TabsTrigger value="existing" className="gap-1.5 text-xs">
                <Icon name="Users" className="w-3.5 h-3.5" />
                <span>Selecionar Existente</span>
              </TabsTrigger>
              <TabsTrigger value="new" className="gap-1.5 text-xs">
                <Icon name="UserPlus" className="w-3.5 h-3.5" />
                <span>Cadastrar Novo</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        )}
      </div>

      {!isEditing && guardianMode === "existing" ? (
        <div className="space-y-4">
          {isLoading ? (
            <p className="text-xs text-muted-foreground">A carregar encarregados registados...</p>
          ) : allGuardians.length === 0 ? (
            <div className="rounded-xs border border-dashed border-border p-4 text-center space-y-2">
              <p className="text-xs text-muted-foreground">
                Ainda não há encarregados registados nesta escola.
              </p>
              <Button
                type="button"
                variant="link"
                size="sm"
                onClick={() => setValue("guardianMode", "new")}
                className="text-xs text-primary font-medium gap-1 h-auto p-0"
              >
                <Icon name="UserPlus" className="w-3.5 h-3.5" />
                Cadastrar o primeiro encarregado
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex flex-col">
                <SelectField
                  label="Encarregado Registado *"
                  value={selectedGuardianId || ""}
                  placeholder="Selecione o encarregado da lista..."
                  options={guardianOptions}
                  onValueChange={(val) => setValue("guardianId", val, { shouldValidate: true })}
                />
                {errors.guardianId && (
                  <span className="text-xs text-destructive mt-1">
                    {errors.guardianId.message}
                  </span>
                )}
              </div>

              {selectedGuardian && (
                <div className="rounded-xs border border-border/70 bg-muted/30 p-3 space-y-1.5 text-xs animate-in fade-in-50 duration-200">
                  <div className="flex items-center justify-between font-medium text-foreground">
                    <span className="flex items-center gap-1.5">
                      <Icon name="User" className="w-3.5 h-3.5 text-primary" />
                      {selectedGuardian.fullName}
                    </span>
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Icon name="Phone" className="w-3.5 h-3.5" />
                      {selectedGuardian.phonePrimary || "Sem telefone"}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-muted-foreground">
                    <span>
                      Doc: <strong className="text-foreground">{selectedGuardian.idDocumentNumber || "N/D"}</strong>
                    </span>
                    {selectedGuardian.email && (
                      <span>
                        Email: <strong className="text-foreground">{selectedGuardian.email}</strong>
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="sm:max-w-xs">
            <SelectField
              label="Grau de Parentesco para este Aluno *"
              value={selectedRelationship}
              options={relationshipOptions}
              onValueChange={(val) => setValue("guardianRelationship", val, { shouldValidate: true })}
            />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-3">
            <Input
              label="Nome do Encarregado *"
              startIcon="User"
              placeholder="Ex: Domingos da Silva"
              {...register("guardianName")}
              error={errors.guardianName?.message}
            />
          </div>

          <div className="sm:col-span-3">
            <Input
              label="Nº do Documento do Encarregado *"
              startIcon="IdCard"
              placeholder="Ex: 004512345LA041"
              {...register("guardianDocument")}
              error={errors.guardianDocument?.message}
            />
            <p className="mt-1 text-[11px] text-muted-foreground">
              Identifica o encarregado na escola e não pode repetir-se. Se ele já está registado (por exemplo, tem outro filho aqui), escolha «Selecionar Existente» em vez de o criar de novo.
            </p>
          </div>

          <Input
            label="Telefone Principal * (9 dígitos, sem +244)"
            startIcon="Phone"
            placeholder="9xxxxxxxx"
            maxLength={9}
            {...register("guardianPhone")}
            error={errors.guardianPhone?.message}
          />

          <div className="sm:col-span-2">
            <SelectField
              label="Grau de Parentesco *"
              value={selectedRelationship}
              options={relationshipOptions}
              onValueChange={(val) => setValue("guardianRelationship", val, { shouldValidate: true })}
            />
          </div>
        </div>
      )}
    </div>
  );
}
