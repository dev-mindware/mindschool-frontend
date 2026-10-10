"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Icon } from "@/components";
import { icons } from "lucide-react";
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
import { TeachersPageContent } from "@/components/client/teachers/teachers-page-content";
import { useAuth } from "@/hooks/auth";
import { useCan } from "@/hooks/auth/use-can";

interface DefSetupProps {
  disabledTabs?: string[];
}

export function DefSetup({ disabledTabs = [] }: DefSetupProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { can } = useCan();
  const role = user?.role ?? "";
  const isManager = ["DIRECTOR_GENERAL", "PEDAGOGIC_DIRECTOR", "SYSTEM_ADMIN", "OWNER", "MANAGER", "ADMIN"].includes(role);
  const isFinance = ["DIRECTOR_GENERAL", "OWNER", "ADMIN", "FINANCIAL"].includes(role);
  const isStaff = isManager || ["SECRETARY", "FINANCIAL"].includes(role);
  const currentTab = searchParams.get("tab");

  type TabItem = {
    id: string;
    label: string;
    icon: keyof typeof icons;
    component: React.ReactNode;
    category: "general" | "workplace";
    isVisible: boolean;
  };

  const allTabs: TabItem[] = [
    {
      id: "profile",
      label: "Perfil",
      icon: "User",
      component: <ProfileSettings />,
      category: "general",
      isVisible: true,
    },
    {
      id: "appearance",
      label: "Aparência",
      icon: "Pencil",
      component: <Appearance />,
      category: "general",
      isVisible: true,
    },
    {
      id: "security",
      label: "Segurança",
      icon: "Shield",
      component: <Security />,
      category: "general",
      isVisible: true,
    },
    {
      id: "notifications",
      label: "Notificações",
      icon: "Bell",
      component: <Notification />,
      category: "general",
      isVisible: true,
    },
    {
      id: "subscription",
      label: "Subscrição",
      icon: "CreditCard",
      component: <SubscriptionManager />,
      category: "general",
      isVisible: isManager && can("subscription:read"),
    },
    {
      id: "guides",
      label: "Guias",
      icon: "Route",
      component: <OnboardingPreferences />,
      category: "general",
      isVisible: true,
    },
    {
      id: "institutional",
      label: "Instituição de Ensino",
      icon: "GraduationCap",
      component: <SchoolInstitutionalSettings />,
      category: "workplace",
      isVisible: isStaff,
    },
    { id: "bank-accounts", label: "Dados Bancários", icon: "Landmark", component: <BankAccountsPageContent />, category: "workplace", isVisible: isFinance && can("bank_account:read") },
    { id: "emails", label: "Emails Enviados", icon: "Mail", component: <SchoolEmailsContent />, category: "workplace", isVisible: isFinance && can("email:read") },
    { id: "policies", label: "Políticas da Escola", icon: "SlidersHorizontal", component: <PoliciesPageContent />, category: "workplace", isVisible: isManager },
    { id: "users", label: "Utilizadores e Papéis", icon: "Users", component: <UsersPageContent />, category: "workplace", isVisible: isManager && can("membership:read") },
    { id: "teachers", label: "Corpo Docente", icon: "GraduationCap", component: <TeachersPageContent />, category: "workplace", isVisible: (isManager || role === "SECRETARY") && can("teacher:read") },
    { id: "imports", label: "Importação de Dados", icon: "Upload", component: <ImportsPageContent />, category: "workplace", isVisible: isStaff && can("import:read") },
    { id: "audit", label: "Auditoria", icon: "ScrollText", component: <AuditPageContent />, category: "workplace", isVisible: (isManager || role === "FINANCIAL") && can("audit:read") },
  ];

  const tabs = allTabs.filter((tab) => tab.isVisible);
  const enabledTabs = tabs.filter((tab) => !disabledTabs.includes(tab.id));
  const generalTabs = enabledTabs.filter((tab) => tab.category === "general");
  const workplaceTabs = enabledTabs.filter((tab) => tab.category === "workplace");

  if (enabledTabs.length === 0) return null;

  const defaultTab = enabledTabs[0]?.id || "appearance";
  const activeTab =
    currentTab && enabledTabs.some((t) => t.id === currentTab)
      ? currentTab
      : defaultTab;

  const handleTabChange = (value: string) => {
    router.push(`?tab=${value}`);
  };

  const renderTabTrigger = (
    tab: (typeof tabs)[0],
    isDesktop: boolean = true,
  ) => {
    const baseClasses = isDesktop
      ? "hover:bg-accent hover:text-foreground data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative w-full justify-start after:absolute after:inset-y-0 after:start-0 after:-ms-1 after:w-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none cursor-pointer"
      : "data-[state=active]:bg-muted data-[state=active]:after:bg-primary relative overflow-hidden rounded-none border py-2 after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 first:rounded-s last:rounded-e cursor-pointer";

    return (
      <TabsTrigger
        key={tab.id}
        value={tab.id}
        className={baseClasses}
        data-tour={`setup-tab-${tab.id}`}
      >
        <Icon
          name={tab.icon}
          className={isDesktop ? "-ms-0.5 me-1.5 opacity-60 text-primary" : ""}
          size={16}
          aria-hidden="true"
        />
        {isDesktop && (
          <p
            className={`font-normal ${activeTab === tab.id ? "text-primary font-medium" : ""}`}
          >
            {tab.label}
          </p>
        )}
      </TabsTrigger>
    );
  };

  return (
    <div data-tour="setup-layout" className="space-y-4">
      <h1 className="text-2xl font-semibold">Definições da Conta</h1>
      
      {/* Desktop Layout - 2 Colunas no padrão MindGest */}
      <div className="hidden md:block">
        <Tabs
          value={activeTab}
          className="flex flex-row w-full mt-5 gap-6 items-start"
          onValueChange={handleTabChange}
        >
          <div className="h-fit min-h-[500px] bg-sidebar rounded-md border border-border/50">
            <TabsList className="sticky top-0 flex-col gap-1 px-1 font-normal bg-transparent rounded-none w-72 text-foreground">
              <div className="p-4 space-y-5 w-full">
                {generalTabs.length > 0 && (
                  <>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide px-1">
                      Gerais
                    </p>
                    <div data-tour="setup-general-tabs" className="space-y-1">
                      {generalTabs.map((tab) => renderTabTrigger(tab, true))}
                    </div>
                  </>
                )}
                {generalTabs.length > 0 && workplaceTabs.length > 0 && (
                  <div className="h-px bg-border my-2" />
                )}
                {workplaceTabs.length > 0 && (
                  <>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide px-1">
                      Ambiente Escolar
                    </p>
                    <div data-tour="setup-workplace-tabs" className="space-y-1">
                      {workplaceTabs.map((tab) => renderTabTrigger(tab, true))}
                    </div>
                  </>
                )}
              </div>
            </TabsList>
          </div>

          <div className="border rounded-md grow min-w-0 text-start bg-card shadow-xs" data-tour="setup-active-content">
            {enabledTabs.map((tab) => (
              <TabsContent key={tab.id} value={tab.id} className="!py-4 sm:p-6 mt-0">
                {tab.component}
              </TabsContent>
            ))}
          </div>
        </Tabs>
      </div>

      {/* Mobile Layout - Carrossel Horizontal no padrão MindGest */}
      <div className="block mt-6 sm:mt-8 md:mt-10 md:hidden">
        <Tabs
          value={activeTab}
          className="w-full"
          onValueChange={handleTabChange}
        >
          <div className="relative -mx-4 px-4 sm:mx-0 sm:px-0">
            <TabsList
              className="h-auto w-full min-w-full inline-flex p-0 shadow-xs bg-background overflow-x-auto overflow-y-hidden scrollbar-hide -space-x-px rtl:space-x-reverse"
              data-tour="setup-general-tabs"
            >
              {enabledTabs.map((tab) => renderTabTrigger(tab, false))}
            </TabsList>
          </div>

          <div className="mt-4 sm:mt-6" data-tour="setup-active-content">
            {enabledTabs.map((tab) => (
              <TabsContent
                key={tab.id}
                value={tab.id}
                className="focus-visible:outline-none focus-visible:ring-0 mt-0"
              >
                {tab.component}
              </TabsContent>
            ))}
          </div>
        </Tabs>
      </div>
    </div>
  );
}
