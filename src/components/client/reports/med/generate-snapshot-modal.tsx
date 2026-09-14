'use client';

import React, { useState, useEffect } from 'react';
import { GlobalModal, SelectField, Button, Icon } from '@/components';
import { MedSnapshotCut } from '@/types/reports-med';

interface GenerateSnapshotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (cut: MedSnapshotCut, academicYear: string) => void;
}

export function GenerateSnapshotModal({
  isOpen,
  onClose,
  onGenerate,
}: GenerateSnapshotModalProps) {
  const [newCut, setNewCut] = useState<MedSnapshotCut>('TERM_1_CLOSE');
  const [newYear, setNewYear] = useState('2025/2026');

  useEffect(() => {
    if (isOpen) {
      setNewCut('TERM_1_CLOSE');
      setNewYear('2025/2026');
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate(newCut, newYear);
  };

  return (
    <GlobalModal
      isOpen={isOpen}
      onClose={onClose}
      title="Gerar Novo Snapshot Estatístico para o MED (UC-08)"
      className="!w-[95vw] sm:!max-w-xl lg:!max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-4 bg-muted/40 rounded-xl border border-border text-xs space-y-2">
          <div className="flex items-center gap-2 font-semibold text-foreground">
            <Icon name="ShieldCheck" className="w-4 h-4 text-primary" />
            Regra de Imutabilidade do Ministério da Educação
          </div>
          <p className="text-muted-foreground leading-relaxed">
            O relatório será congelado em formato de snapshot a partir das pautas oficiais fechadas. Os dados consolidados
            não sofrerão alterações automáticas posteriores, servindo como documento de prestação de contas à Inspecção Geral.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SelectField
            label="Corte Oficial de Prestação de Contas"
            value={newCut}
            onValueChange={(val) => setNewCut(val as MedSnapshotCut)}
            options={[
              { label: 'Fecho do 1.º Trimestre', value: 'TERM_1_CLOSE' },
              { label: 'Fecho do 2.º Trimestre', value: 'TERM_2_CLOSE' },
              { label: 'Fecho Anual / Pauta Final', value: 'FINAL_YEAR' },
              { label: 'Início do Ano Lectivo (Abertura)', value: 'ENROLLMENT_START' },
            ]}
          />

          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              Ano Lectivo
            </label>
            <input
              type="text"
              required
              value={newYear}
              onChange={(e) => setNewYear(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background font-mono"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" className="gap-2">
            <Icon name="Camera" className="w-4 h-4" />
            Congelar Snapshot Oficial
          </Button>
        </div>
      </form>
    </GlobalModal>
  );
}
