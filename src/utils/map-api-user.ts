import { SubscriptionStatus, type Company, type PlanType, type Role, type Subscription, type User } from "@/types";
import { pickPrimaryRole } from "./api-roles";

/** Resposta de `GET /auth/me` da API MindEscola. */
export interface ApiMe {
  id: string;
  email: string;
  full_name: string;
  mfa_enabled: boolean;
  memberships: Array<{ school_id: string; school_name: string; roles: string[]; permissions?: string[] }>;
  /** Presente numa sessão de personificação (suporte): quem assumiu a identidade, porquê, até quando e se pode escrever. */
  impersonation?: { id: string; admin_user_id: string; reason: string; expires_at: string; write_enabled: boolean };
}

/** Resposta de `GET /schools/:id/subscription` (parte usada pelo frontend). */
export interface ApiSubscription {
  subscription: { id: string; status: string; plan: { code: string; name: string }; trial_ends_at: string | null; period_start: string | null; period_end: string | null };
}

const STATUS_MAP: Record<string, SubscriptionStatus> = {
  trial: SubscriptionStatus.TRIALING,
  active: SubscriptionStatus.ACTIVE,
  grace: SubscriptionStatus.PAST_DUE,
  suspended: SubscriptionStatus.CANCELED,
  cancelled: SubscriptionStatus.CANCELED,
  expired: SubscriptionStatus.EXPIRED,
};

/** Planos MindEscola -> niveis do frontend herdado (Base < Smart < Pro). */
const PLAN_MAP: Record<string, PlanType> = { essencial: "Base", profissional: "Smart", enterprise: "Pro" };

export function mapApiSubscription(res: ApiSubscription): Subscription {
  const s = res.subscription;
  return {
    id: s.id,
    status: STATUS_MAP[s.status] ?? SubscriptionStatus.ACTIVE,
    trialEndsAt: s.trial_ends_at ?? "",
    periodStartsAt: s.period_start ?? "",
    periodEndsAt: s.period_end ?? "",
    plan: { id: s.plan.code, name: PLAN_MAP[s.plan.code] ?? "Base" },
  } as unknown as Subscription;
}

export function primaryRoleOf(me: ApiMe, schoolId?: string | null): Role | null {
  const m = me.memberships.find((x) => x.school_id === schoolId) ?? me.memberships[0];
  return m ? pickPrimaryRole(m.roles) : null;
}

/**
 * API -> `User` do frontend. O papel e o da escola activa; `company` representa a escola activa
 * (o frontend herdou o conceito de "empresa" do MindGest).
 */
export function mapApiUser(me: ApiMe, schoolId?: string | null, subscription?: Subscription): User {
  const active = me.memberships.find((x) => x.school_id === schoolId) ?? me.memberships[0];
  return {
    id: me.id,
    email: me.email,
    name: me.full_name,
    role: (active ? pickPrimaryRole(active.roles) : null) ?? "GUARDIAN",
    phone: "",
    company: { id: active?.school_id ?? "", name: active?.school_name ?? "", isActive: true, subscription } as unknown as Company,
    subscription,
    mfaEnabled: me.mfa_enabled,
    memberships: me.memberships.map((m) => ({ schoolId: m.school_id, schoolName: m.school_name, roles: m.roles })),
  };
}
