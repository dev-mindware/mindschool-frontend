"use client";

import { FamilyProfile } from "@/modules/family/components/family-profile";
import { Icon } from "@/components";
import { ROLE_LABELS } from "@/constants/roles";
import { useAuth } from "@/hooks/auth";
import { useActiveSchoolStore } from "@/stores/school/active-school-store";

/** Aba «Perfil» das Configurações: encarregado/aluno têm a ficha do portal; o pessoal da escola vê a sua conta e o vínculo à escola. */
export function ProfileSettings() {
  const { user } = useAuth();
  const { schoolId, memberships } = useActiveSchoolStore();

  if (user?.role === "GUARDIAN" || user?.role === "STUDENT") return <FamilyProfile />;
  if (!user) return null;
  const school = memberships.find((m) => m.schoolId === schoolId) ?? memberships[0];

  const rows: Array<[string, string]> = [
    ["Nome", user.name],
    ["Email de acesso", user.email],
    ["Papel", ROLE_LABELS[user.role] ?? user.role],
    ["Escola", school?.schoolName ?? user.company?.name ?? "—"],
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Perfil</h2>
        <p className="mt-1 text-xs text-muted-foreground">Os seus dados na plataforma. Palavra-passe e email de acesso alteram-se na aba «Segurança».</p>
      </div>
      <section className="max-w-xl rounded-xl border bg-card p-5">
        <h3 className="mb-2 flex items-center gap-2 text-base font-semibold"><Icon name="User" className="size-4 text-primary" />Dados da conta</h3>
        {rows.map(([label, value]) => (
          <div key={label} className="flex flex-wrap items-baseline justify-between gap-2 border-b py-2.5 text-sm last:border-0">
            <span className="text-muted-foreground">{label}</span>
            <span className="text-right font-medium">{value}</span>
          </div>
        ))}
      </section>
    </div>
  );
}
