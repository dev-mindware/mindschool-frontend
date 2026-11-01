"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { resetScrollSoon } from "@/components/common/scroll-to-top";
import { Appearance } from "./contents/appearance";
import { ProfileSettings } from "./contents/profile-settings";
import { Notification } from "./contents/notifications";
import { Security } from "./contents/security";
import { SubscriptionManager } from "@/components/client/subscription/subscription-manager";
import { OnboardingPreferences } from "./contents/onboarding-preferences";
import { SchoolInstitutionalSettings } from "@/components/client/settings/school/school-institutional-settings";
import { UsersPageContent } from "@/components/client/settings/users/users-page-content";
import { PoliciesPageContent } from "@/components/client/settings/policies/policies-page-content";
import { ImportsPageContent } from "@/components/client/settings/imports/imports-page-content";
import { AuditPageContent } from "@/components/client/settings/audit/audit-page-content";
import { BankAccountsPageContent } from "@/components/client/settings/bank-accounts/bank-accounts-page-content";
import { SchoolEmailsContent } from "@/components/client/settings/emails/school-emails-content";
import { MindgestSettings } from "@/components/client/settings/integrations/mindgest-settings";
import { TeachersPageContent } from "@/components/client/teachers/teachers-page-content";
import { useAuth } from "@/hooks/auth";
import { useCan } from "@/hooks/auth/use-can";
import { useIsMobile } from "@/hooks/use-mobile";
import { DesktopDefinitionsView } from "./desktop-definitions-view";
import { MobileDefinitionsView } from "./mobile-definitions-view";
import type { DefinitionTabItem, DefSetupProps } from "./types";

export function DefSetup({ disabledTabs = [] }: DefSetupProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { can } = useCan();
  const isMobile = useIsMobile();

  const role = user?.role ?? "";
  // O administrador de sistema opera a plataforma, não uma escola: só vê as definições da conta (sem «Ambiente Escolar» nem Subscrição).
  const isManager = [
    "DIRECTOR_GENERAL",
    "PEDAGOGIC_DIRECTOR",
    "OWNER",
    "MANAGER",
    "ADMIN",
  ].includes(role);
  const isFinance = ["DIRECTOR_GENERAL", "OWNER", "ADMIN", "FINANCIAL"].includes(
    role,
  );
  const isStaff = isManager || ["SECRETARY", "FINANCIAL"].includes(role);
  const currentTab = searchParams.get("tab");

  const allTabs: DefinitionTabItem[] = [
    {
      id: "profile",
      label: "Perfil",
      description: "Dados pessoais, nome e informações de contacto",
      icon: "User",
      component: <ProfileSettings />,
      category: "general",
      isVisible: true,
    },
    {
      id: "appearance",
      label: "Aparência",
      description: "Tema visual claro ou escuro e preferências de ecrã",
      icon: "Pencil",
      component: <Appearance />,
      category: "general",
      isVisible: true,
    },
    {
      id: "security",
      label: "Segurança",
      description: "Palavra-passe, passkeys e autenticação de dois factores",
      icon: "Shield",
      component: <Security />,
      category: "general",
      isVisible: true,
    },
    {
      id: "notifications",
      label: "Notificações",
      description: "Alertas in-app e preferências de comunicação",
      icon: "Bell",
      component: <Notification />,
      category: "general",
      isVisible: true,
    },
    {
      id: "subscription",
      label: "Subscrição",
      description: "Plano actual da escola, faturas e renovação",
      icon: "CreditCard",
      component: <SubscriptionManager />,
      category: "general",
      isVisible: isManager && can("subscription:read"),
    },
    {
      id: "guides",
      label: "Guias",
      description: "Tutoriais interactivos de arranque e ajuda contextual",
      icon: "Route",
      component: <OnboardingPreferences />,
      category: "general",
      isVisible: true,
    },
    {
      id: "institutional",
      label: "Instituição de Ensino",
      description: "Identificação oficial no MED, logotipo e direcção",
      icon: "GraduationCap",
      component: <SchoolInstitutionalSettings />,
      category: "workplace",
      isVisible: isStaff,
    },
    {
      id: "bank-accounts",
      label: "Dados Bancários",
      description: "Contas bancárias e IBAN para pagamento de propinas",
      icon: "Landmark",
      component: <BankAccountsPageContent />,
      category: "workplace",
      isVisible: isFinance && can("bank_account:read"),
    },
    {
      id: "emails",
      label: "Emails Enviados",
      description: "Registo e estado de entrega das mensagens enviadas",
      icon: "Mail",
      component: <SchoolEmailsContent />,
      category: "workplace",
      isVisible: isFinance && can("email:read"),
    },
    {
      id: "policies",
      label: "Políticas da Escola",
      description: "Regras de avaliação, faltas, exames e prazos financeiros",
      icon: "SlidersHorizontal",
      component: <PoliciesPageContent />,
      category: "workplace",
      isVisible: isManager,
    },
    {
      id: "users",
      label: "Utilizadores e Papéis",
      description: "Equipa administrativa, permissões e convites de acesso",
      icon: "Users",
      component: <UsersPageContent />,
      category: "workplace",
      isVisible: isManager && can("membership:read"),
    },
    {
      id: "teachers",
      label: "Corpo Docente",
      description: "Fichas dos professores e credenciais de ponto por QR",
      icon: "GraduationCap",
      component: <TeachersPageContent />,
      category: "workplace",
      isVisible: (isManager || role === "SECRETARY") && can("teacher:read"),
    },
    {
      id: "integrations",
      label: "Integrações",
      description: "Sincronização contabilística e fiscal com o MindGest",
      icon: "Plug",
      component: <MindgestSettings />,
      category: "workplace",
      isVisible: isManager && can("integration:mindgest_manage"),
    },
    {
      id: "imports",
      label: "Importação de Dados",
      description: "Carregamento em lote de alunos, turmas e saldos",
      icon: "Upload",
      component: <ImportsPageContent />,
      category: "workplace",
      isVisible: isStaff && can("import:read"),
    },
    {
      id: "audit",
      label: "Auditoria",
      description: "Histórico cronológico de operações críticas na escola",
      icon: "ScrollText",
      component: <AuditPageContent />,
      category: "workplace",
      isVisible: (isManager || role === "FINANCIAL") && can("audit:read"),
    },
  ];

  const tabs = allTabs.filter((tab) => tab.isVisible);
  const enabledTabs = tabs.filter((tab) => !disabledTabs.includes(tab.id));
  const generalTabs = enabledTabs.filter((tab) => tab.category === "general");
  const workplaceTabs = enabledTabs.filter((tab) => tab.category === "workplace");

  if (enabledTabs.length === 0) return null;

  const defaultTab = enabledTabs[0]?.id || "appearance";
  const hasValidUrlTab = Boolean(
    currentTab && enabledTabs.some((t) => t.id === currentTab),
  );
  const activeTab = hasValidUrlTab && currentTab ? currentTab : defaultTab;
  const activeTabObj =
    enabledTabs.find((t) => t.id === activeTab) ?? enabledTabs[0]!;

  const handleTabChange = (value: string) => {
    router.push(`?tab=${value}`);
    // o separador muda só a query: o ScrollToTop (por caminho) não corre e a página abria a meio
    resetScrollSoon();
  };

  const handleBackToHub = () => {
    router.push("/settings");
    resetScrollSoon();
  };

  return (
    <div data-tour="setup-layout">
      <DesktopDefinitionsView
        activeTab={activeTab}
        enabledTabs={enabledTabs}
        generalTabs={generalTabs}
        workplaceTabs={workplaceTabs}
        isMobile={isMobile}
        onTabChange={handleTabChange}
      />

      <MobileDefinitionsView
        activeTab={activeTab}
        activeTabObj={activeTabObj}
        hasValidUrlTab={hasValidUrlTab}
        generalTabs={generalTabs}
        workplaceTabs={workplaceTabs}
        isMobile={isMobile}
        onTabChange={handleTabChange}
        onBackToHub={handleBackToHub}
      />
    </div>
  );
}
