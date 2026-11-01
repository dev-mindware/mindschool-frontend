"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button, EmptyState, Icon, Input } from "@/components";
import { resetScrollSoon } from "@/components/common/scroll-to-top";
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
import { MindgestSettings } from "@/components/client/settings/integrations/mindgest-settings";
import { TeachersPageContent } from "@/components/client/teachers/teachers-page-content";
import { useAuth } from "@/hooks/auth";
import { useCan } from "@/hooks/auth/use-can";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { normalize } from "@/utils/normalize-string";

interface DefSetupProps {
  disabledTabs?: string[];
}

export function DefSetup({ disabledTabs = [] }: DefSetupProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { can } = useCan();
  const isMobile = useIsMobile();
  const [hubSearch, setHubSearch] = useState("");
  const [switcherOpen, setSwitcherOpen] = useState(false);

  const role = user?.role ?? "";
  // O administrador de sistema opera a plataforma, não uma escola: só vê as definições da conta (sem «Ambiente Escolar» nem Subscrição).
  const isManager = ["DIRECTOR_GENERAL", "PEDAGOGIC_DIRECTOR", "OWNER", "MANAGER", "ADMIN"].includes(role);
  const isFinance = ["DIRECTOR_GENERAL", "OWNER", "ADMIN", "FINANCIAL"].includes(role);
  const isStaff = isManager || ["SECRETARY", "FINANCIAL"].includes(role);
  const currentTab = searchParams.get("tab");

  type TabItem = {
    id: string;
    label: string;
    description: string;
    icon: keyof typeof icons;
    component: React.ReactNode;
    category: "general" | "workplace";
    isVisible: boolean;
  };

  const allTabs: TabItem[] = [
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
  const hasValidUrlTab = Boolean(currentTab && enabledTabs.some((t) => t.id === currentTab));
  const activeTab = hasValidUrlTab && currentTab ? currentTab : defaultTab;
  const activeTabObj = enabledTabs.find((t) => t.id === activeTab) ?? enabledTabs[0];

  const handleTabChange = (value: string) => {
    router.push(`?tab=${value}`);
    setSwitcherOpen(false);
    // o separador muda só a query: o ScrollToTop (por caminho) não corre e a página abria a meio
    resetScrollSoon();
  };

  const handleBackToHub = () => {
    router.push("/settings");
    resetScrollSoon();
  };

  const renderDesktopTabTrigger = (tab: TabItem) => (
    <TabsTrigger
      key={tab.id}
      value={tab.id}
      className="hover:bg-accent hover:text-foreground data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative w-full justify-start after:absolute after:inset-y-0 after:start-0 after:-ms-1 after:w-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
      data-tour={`setup-tab-${tab.id}`}
    >
      <Icon
        name={tab.icon}
        className="-ms-0.5 me-1.5 opacity-60 text-primary"
        size={16}
        aria-hidden="true"
      />
      <p className={`font-normal ${activeTab === tab.id ? "text-primary font-medium" : ""}`}>
        {tab.label}
      </p>
    </TabsTrigger>
  );

  const q = normalize(hubSearch.trim());
  const filterHub = (list: TabItem[]) =>
    !q
      ? list
      : list.filter((t) =>
          normalize(`${t.label} ${t.description}`).includes(q)
        );
  const filteredGeneral = filterHub(generalTabs);
  const filteredWorkplace = filterHub(workplaceTabs);

  const renderMobileGroup = (title: string, items: TabItem[], tourId?: string) => {
    if (items.length === 0) return null;
    return (
      <div className="space-y-2" data-tour={tourId}>
        <p className="px-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </p>
        <div className="divide-y divide-border/60 rounded-xs border border-border bg-card shadow-2xs overflow-hidden">
          {items.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id)}
              data-tour={`setup-tab-${tab.id}`}
              className="flex w-full items-center gap-3.5 p-3.5 text-left transition-colors hover:bg-muted/40 active:bg-muted/60"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xs bg-primary/10 text-primary">
                <Icon name={tab.icon} className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground truncate">
                  {tab.label}
                </p>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {tab.description}
                </p>
              </div>
              <Icon
                name="ChevronRight"
                className="size-4 shrink-0 text-muted-foreground/70"
              />
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div data-tour="setup-layout">
      {/* DESKTOP VIEW: Sidebar Esquerda + Painel Direito */}
      <div className="hidden md:block">
        <h1 className="text-2xl font-semibold">Definições da Conta</h1>
        <Tabs
          value={activeTab}
          className="flex-row w-full mt-5"
          onValueChange={handleTabChange}
        >
          <div className="h-screen bg-sidebar rounded-xs">
            <TabsList className="sticky top-0 flex-col gap-1 px-1 font-normal bg-transparent rounded-none w-75 text-foreground">
              <div className="p-4 space-y-5">
                {generalTabs.length > 0 && (
                  <>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">
                      Gerais
                    </p>
                    <div data-tour="setup-general-tabs">
                      {generalTabs.map((tab) => renderDesktopTabTrigger(tab))}
                    </div>
                  </>
                )}
                {generalTabs.length > 0 && workplaceTabs.length > 0 && (
                  <div className="h-px bg-border" />
                )}
                {workplaceTabs.length > 0 && (
                  <>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">
                      Ambiente Escolar
                    </p>
                    <div data-tour="setup-workplace-tabs">
                      {workplaceTabs.map((tab) => renderDesktopTabTrigger(tab))}
                    </div>
                  </>
                )}
              </div>
            </TabsList>
          </div>

          <div
            className="border rounded-xs grow min-w-0 text-start"
            data-tour="setup-active-content"
          >
            {!isMobile &&
              enabledTabs.map((tab) => (
                <TabsContent key={tab.id} value={tab.id} className="py-4 sm:p-6">
                  {tab.component}
                </TabsContent>
              ))}
          </div>
        </Tabs>
      </div>

      {/* MOBILE VIEW: Settings Hub (Lista Agrupada) ou Vista de Detalhe com Quick Switcher */}
      <div className="block md:hidden">
        {!hasValidUrlTab ? (
          <div className="space-y-5">
            <div className="space-y-1">
              <h1 className="text-xl font-semibold text-foreground">
                Definições da Conta
              </h1>
              <p className="text-xs text-muted-foreground">
                Seleccione uma categoria para gerir a sua conta ou o ambiente escolar.
              </p>
            </div>

            <Input
              label=""
              startIcon="Search"
              value={hubSearch}
              onChange={(e) => setHubSearch(e.target.value)}
              placeholder="Pesquisar definição (ex.: palavra-passe, banco, notas)..."
              className="h-10 text-xs"
            />

            {filteredGeneral.length === 0 && filteredWorkplace.length === 0 ? (
              <EmptyState
                icon="SearchX"
                title="Nenhuma definição encontrada"
                description="Tente pesquisar por outro termo ou limpe a pesquisa."
              />
            ) : (
              <div className="space-y-6 pb-4">
                {renderMobileGroup("Gerais", filteredGeneral, "setup-general-tabs")}
                {renderMobileGroup("Ambiente Escolar", filteredWorkplace, "setup-workplace-tabs")}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Barra de Navegação Móvel no Topo da Secção */}
            <div className="flex items-center justify-between gap-2 rounded-xs border border-border bg-card p-2 shadow-2xs">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleBackToHub}
                className="h-8 gap-1.5 px-2 text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                <Icon name="ArrowLeft" className="size-3.5" />
                <span>Todas as definições</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSwitcherOpen(true)}
                className="h-8 max-w-[210px] gap-1.5 rounded-xs px-2.5 text-xs font-medium"
              >
                <Icon name={activeTabObj.icon} className="size-3.5 shrink-0 text-primary" />
                <span className="truncate">{activeTabObj.label}</span>
                <Icon name="ChevronDown" className="size-3.5 shrink-0 text-muted-foreground" />
              </Button>
            </div>

            {/* Conteúdo da Secção Activa */}
            <div data-tour="setup-active-content" className="pt-1">
              {isMobile && activeTabObj.component}
            </div>

            {/* Bottom Sheet Quick Switcher para saltar directamente entre secções */}
            <Sheet open={switcherOpen} onOpenChange={setSwitcherOpen}>
              <SheetContent
                side="bottom"
                className="max-h-[82dvh] flex flex-col gap-0 p-0 rounded-t-xl border-t md:hidden"
              >
                <div className="mx-auto mt-2.5 h-1.5 w-10 shrink-0 rounded-full bg-muted-foreground/25" />
                <SheetHeader className="border-b px-4 py-3 text-left">
                  <SheetTitle className="text-base font-semibold">
                    Mudar de secção
                  </SheetTitle>
                </SheetHeader>
                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 space-y-5">
                  {[
                    { title: "Gerais", items: generalTabs },
                    { title: "Ambiente Escolar", items: workplaceTabs },
                  ]
                    .filter((g) => g.items.length > 0)
                    .map((group) => (
                      <div key={group.title} className="space-y-2">
                        <p className="px-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                          {group.title}
                        </p>
                        <div className="divide-y divide-border/60 rounded-xs border border-border bg-card overflow-hidden">
                          {group.items.map((tab) => {
                            const isCurrent = tab.id === activeTab;
                            return (
                              <button
                                key={tab.id}
                                type="button"
                                onClick={() => handleTabChange(tab.id)}
                                className={cn(
                                  "flex w-full items-center gap-3 px-3.5 py-2.5 text-left transition-colors",
                                  isCurrent ? "bg-primary/8 font-medium" : "hover:bg-muted/40"
                                )}
                              >
                                <span
                                  className={cn(
                                    "flex size-7 shrink-0 items-center justify-center rounded-xs",
                                    isCurrent
                                      ? "bg-primary text-primary-foreground"
                                      : "bg-muted text-muted-foreground"
                                  )}
                                >
                                  <Icon name={tab.icon} className="size-3.5" />
                                </span>
                                <span className="flex-1 truncate text-xs text-foreground">
                                  {tab.label}
                                </span>
                                {isCurrent && (
                                  <Icon name="Check" className="size-4 shrink-0 text-primary" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        )}
      </div>
    </div>
  );
}
