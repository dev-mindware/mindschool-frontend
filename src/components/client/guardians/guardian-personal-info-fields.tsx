'use client';

import React from 'react';
import { UseFormRegister, FieldErrors, UseFormWatch } from 'react-hook-form';
import { Input } from '@/components';
import { NifVerifyField } from '@/components/client/finance/nif-verify-field';

interface GuardianPersonalInfoFieldsProps {
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  watch: UseFormWatch<any>;
  onResolvedName?: (name: string) => void;
}

export function GuardianPersonalInfoFields({
  register,
  errors,
  watch,
  onResolvedName,
}: GuardianPersonalInfoFieldsProps) {
  return (
    <div className="space-y-3">
      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        1. Dados Pessoais & Identificação
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <Input
            label="Nome Completo *"
            startIcon="User"
            placeholder="Ex: João Baptista Afonso"
            {...register('fullName')}
            error={errors.fullName?.message as string | undefined}
          />
        </div>

        <Input
          label="Número do BI / Documento"
          startIcon="CreditCard"
          placeholder="Ex: 001928374LA038"
          {...register('idDocumentNumber')}
          error={errors.idDocumentNumber?.message as string | undefined}
        />
        <div className="sm:col-span-2">
          <NifVerifyField register={register} errors={errors} watch={watch} {...(onResolvedName ? { onResolvedName } : {})} />
        </div>


        <Input
          label="Profissão / Ocupação"
          startIcon="Briefcase"
          placeholder="Ex: Engenheiro Civil"
          {...register('profession')}
          error={errors.profession?.message as string | undefined}
        />

        <div className="sm:col-span-2">
          <Input
            label="Local de Trabalho"
            startIcon="Building2"
            placeholder="Ex: Ministério dos Transportes, Luanda"
            {...register('workplace')}
            error={errors.workplace?.message as string | undefined}
          />
        </div>
      </div>
    </div>
  );
}
