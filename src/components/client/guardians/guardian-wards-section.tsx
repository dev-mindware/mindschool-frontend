'use client';

import React from 'react';
import { GuardianWard } from '@/types';
import { Avatar, AvatarFallback, Button, Badge, Icon, SelectField, PaginatedSelect } from '@/components';

interface StudentOption {
  value: string;
  label: string;
  description: string;
}

interface GuardianWardsSectionProps {
  wards: GuardianWard[];
  candidateStudentId: string;
  candidateRelationship: string;
  relationshipOptions: { value: string; label: string }[];
  relationshipLabels: Record<string, string>;
  studentSearch: string;
  studentPage: number;
  totalPages: number;
  studentOptions: StudentOption[];
  onSelectCandidateStudent: (id: string) => void;
  onChangeCandidateRelationship: (rel: string) => void;
  onSearchStudents: (search: string) => void;
  onPageChange: (page: number) => void;
  onAddWard: () => void;
  onRemoveWard: (studentId: string) => void;
}

const getInitials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join('');

export function GuardianWardsSection({
  wards,
  candidateStudentId,
  candidateRelationship,
  relationshipOptions,
  relationshipLabels,
  studentSearch,
  studentPage,
  totalPages,
  studentOptions,
  onSelectCandidateStudent,
  onChangeCandidateRelationship,
  onSearchStudents,
  onPageChange,
  onAddWard,
  onRemoveWard,
}: GuardianWardsSectionProps) {
  return (
    <div className="space-y-3 p-3 rounded-xs bg-muted/30">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Icon name="GraduationCap" className="h-4 w-4 text-primary" />
            3. Educandos a Cargo ({wards.length})
          </h4>
          <p className="text-xs text-muted-foreground mt-0.5">
            Todos os alunos aos quais este encarregado responde
          </p>
        </div>
        {wards.length > 0 && (
          <Badge variant="outline" className="text-xs font-normal">
            {wards.length} educando(s) associado(s)
          </Badge>
        )}
      </div>

      {/* Lista de Educandos Existentes */}
      {wards.length > 0 ? (
        <div className="space-y-2 pt-1">
          {wards.map((ward) => (
            <div
              key={ward.studentId}
              className="flex items-center justify-between p-3 rounded-xs border border-border/60 bg-background/60 transition"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                    {getInitials(ward.studentName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {ward.studentName}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge variant="secondary" className="text-[11px] font-normal">
                      {relationshipLabels[ward.relationship] || ward.relationship}
                    </Badge>
                    {ward.isPrimaryContact && (
                      <Badge variant="success" className="text-[10px] font-medium">
                        Contacto Principal
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onRemoveWard(ward.studentId)}
                className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
                title="Remover educando"
              >
                <Icon name="Trash2" className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-3 text-center border border-dashed rounded-xs text-xs text-muted-foreground">
          Nenhum educando associado. Adicione educandos usando o seletor abaixo.
        </div>
      )}

      {/* Bloco para Adicionar Novo Educando com PaginatedSelect */}
      <div className="pt-3 border-t space-y-3">
        <span className="text-xs font-semibold text-foreground block">
          Vincular Aluno da Escola
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
          <div className="sm:col-span-2">
            <PaginatedSelect
              label="Pesquisar Estudante (com paginação)"
              value={candidateStudentId}
              onChange={onSelectCandidateStudent}
              placeholder="Selecione ou pesquise o aluno..."
              searchPlaceholder="Pesquise por nome ou nº processo..."
              searchValue={studentSearch}
              onSearchChange={onSearchStudents}
              pagination={{ page: studentPage, totalPages }}
              onPageChange={onPageChange}
              options={studentOptions}
              fullWidth
            />
          </div>

          <div>
            <SelectField
              label="Grau de Parentesco"
              value={candidateRelationship}
              options={relationshipOptions}
              onValueChange={onChangeCandidateRelationship}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={!candidateStudentId}
            onClick={onAddWard}
            className="gap-1.5"
          >
            <Icon name="Plus" className="h-4 w-4" />
            Adicionar aos Educandos
          </Button>
        </div>
      </div>
    </div>
  );
}
