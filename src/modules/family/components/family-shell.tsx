"use client";

import type { ReactNode } from "react";
import { Badge, EmptyState, FormSelect, TitleList } from "@/components";
import { useFamilyStudent } from "@/modules/family/hooks/use-family-student";
import type { PortalWard } from "@/modules/family/services/portal-service";

export interface FamilyContext {
  studentId: string;
  ward: PortalWard;
}

interface Props {
  title: string;
  description: string;
  /** Páginas que não dependem de um educando (ex.: comunicados, perfil) dispensam o selector. */
  perStudent?: boolean;
  children: (ctx: FamilyContext) => ReactNode;
}

/** Cabeçalho comum da área da família: título, selector de educando (na URL) e estados de carregamento/vazio. */
export function FamilyShell({ title, description, perStudent = true, children }: Props) {
  const { wards, wardsLoading, ward, studentId, setStudentId } = useFamilyStudent();

  if (wardsLoading) return <div className="text-sm text-muted-foreground">A carregar…</div>;
  if (!ward) return <EmptyState icon="Users" title="Sem educandos" description="Não há educandos associados à sua conta nesta escola." />;

  return (
    <div className="space-y-6">
      <TitleList title={title} suTitle={description}>
        {perStudent && wards.length > 1 && (
          <div className="w-60"><FormSelect label="Educando" value={studentId} onValueChange={setStudentId} options={wards.map((w) => ({ value: w.student.id, label: w.student.full_name }))} /></div>
        )}
      </TitleList>
      {perStudent && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xs border bg-card p-4">
          <div>
            <h3 className="font-semibold text-foreground">{ward.student.full_name}</h3>
            <p className="text-xs text-muted-foreground">
              {ward.current_enrollment ? `${ward.current_enrollment.class_level} ${ward.current_enrollment.section} • ${ward.current_enrollment.shift}` : "Sem matrícula ativa"} • {ward.relationship_type}
            </p>
          </div>
          <Badge variant="outline">{ward.student.status}</Badge>
        </div>
      )}
      {children({ studentId, ward })}
    </div>
  );
}
