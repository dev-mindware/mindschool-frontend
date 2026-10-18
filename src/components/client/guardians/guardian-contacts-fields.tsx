'use client';

import React from 'react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { Input } from '@/components';
import { PreferredContactChannel } from '@/types';

interface GuardianContactsFieldsProps {
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  /** Mantidos por compatibilidade com o modal: o canal preferencial não é gravado (ver nota abaixo). */
  selectedChannel?: PreferredContactChannel;
  channelOptions?: { value: string; label: string }[];
  onChannelChange?: (val: PreferredContactChannel) => void;
}

/**
 * Só se pedem os contactos que a API grava (telefone e e-mail). O telefone alternativo, a morada e o canal preferencial
 * já não se pedem: não eram guardados em lado nenhum, e a escolha parecia ter efeito.
 */
export function GuardianContactsFields({ register, errors }: GuardianContactsFieldsProps) {
  return (
    <div className="space-y-3">
      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        2. Contactos & Notificações
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Telefone Principal * (9 dígitos, sem +244)"
          startIcon="Phone"
          placeholder="9xxxxxxxx"
          maxLength={9}
          {...register('phonePrimary')}
          error={errors.phonePrimary?.message as string | undefined}
        />

        <Input
          type="email"
          label="Endereço de E-mail"
          startIcon="Mail"
          placeholder="exemplo@dominio.ao"
          {...register('email')}
          error={errors.email?.message as string | undefined}
        />

        <p className="sm:col-span-2 text-xs text-muted-foreground">
          É para estes contactos que seguem os avisos da escola (propinas, faltas, circulares): o telefone para WhatsApp/SMS e o e-mail para os avisos por correio. Sem e-mail, os avisos por e-mail falham. As preferências por tipo de aviso definem-se no portal do encarregado.
        </p>
      </div>
    </div>
  );
}
