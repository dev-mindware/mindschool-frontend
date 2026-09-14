'use client';

import React from 'react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { Input, SelectField } from '@/components';
import { PreferredContactChannel } from '@/types';

interface GuardianContactsFieldsProps {
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  selectedChannel: PreferredContactChannel;
  channelOptions: { value: string; label: string }[];
  onChannelChange: (val: PreferredContactChannel) => void;
}

export function GuardianContactsFields({
  register,
  errors,
  selectedChannel,
  channelOptions,
  onChannelChange,
}: GuardianContactsFieldsProps) {
  return (
    <div className="space-y-3">
      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        2. Contactos & Notificações
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Telefone Principal (WhatsApp) *"
          startIcon="Phone"
          placeholder="9xxxxxxxx"
          maxLength={9}
          {...register('phonePrimary')}
          error={errors.phonePrimary?.message as string | undefined}
        />

        <Input
          label="Telefone Alternativo"
          startIcon="Phone"
          placeholder="9xxxxxxxx"
          maxLength={9}
          {...register('phoneSecondary')}
          error={errors.phoneSecondary?.message as string | undefined}
        />

        <Input
          type="email"
          label="Endereço de E-mail"
          startIcon="Mail"
          placeholder="exemplo@dominio.ao"
          {...register('email')}
          error={errors.email?.message as string | undefined}
        />

        <SelectField
          label="Canal Preferencial de Aviso *"
          value={selectedChannel}
          options={channelOptions}
          onValueChange={(val) => onChannelChange(val as PreferredContactChannel)}
        />

        <div className="sm:col-span-2">
          <Input
            label="Morada / Bairro de Residência"
            startIcon="MapPin"
            placeholder="Ex: Maianga, Rua Amílcar Cabral, Luanda"
            {...register('address')}
            error={errors.address?.message as string | undefined}
          />
        </div>
      </div>
    </div>
  );
}
