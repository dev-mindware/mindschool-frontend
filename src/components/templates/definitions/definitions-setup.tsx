"use client";

import { Profile } from "./contents/profile";
import { Appearance } from "./contents/appearance";
import { Notification } from "./contents/notifications";
import { CategoriesPageContent, Icon } from "@/components";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CollaboratorsPageContent,
  OnboardingPreferences,
  StoresPageContent,
  SubscriptionInfo,
} from "./contents";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/auth";
import { hasPlanAccess } from "@/lib/features";
import { PlanType } from "@/types";
import { BankPageContent } from "./contents/banks";
import { icons } from "lucide-react";
import { Security } from "./contents/security";
import { AgtPageContent } from "./contents/agt";

interface DefSetupProps {
  disabledTabs?: string[];
}

export function DefSetup({ disabledTabs = [] }: DefSetupProps) {
  const { user, subscriptionStatus } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab");
  const isActive = subscriptionStatus === "ACTIVE";

  const currentPlan =
    (user?.company?.subscription?.plan?.name as PlanType) || "Base";
  const isOwner = user?.role === "OWNER";

  type Tabs = {
    id: string;
    label: string;
    icon: keyof typeof icons;
    component: React.ReactNode;
    category: "general" | "workplace";
    isVisible: boolean;
  };

  const allTabs: Tabs[] = [
     {
      id: "profile",
      label: "Perfil",
      icon: "User",
      component: <Profile />,
      category: "general",
      isVisible: true,
    },
    {
      id: "appearance",
      label: "Aparência",
      icon: "Pencil",
      component: <Appearance />,
      category: "general",
      isVisible: isActive && hasPlanAccess(currentPlan, "Smart") && isOwner,
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
      isVisible: isActive,
    },
    {
      id: "subscription",
      label: "Subscrição",
      icon: "CreditCard",
      component: <SubscriptionInfo />,
      category: "general",
      isVisible: isOwner,
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
      id: "collaborators",
      label: "Colaboradores",
      icon: "BriefcaseBusiness",
      component: <CollaboratorsPageContent />,
      category: "workplace",
      isVisible: isActive,
    },
    {
      id: "categories",
      label: "Categorias",
      icon: "Tag",
      component: <CategoriesPageContent />,
      category: "workplace",
      isVisible: isActive,
    },
    {
      id: "entities",
      label: "Lojas",
      icon: "Store",
      component: <StoresPageContent />,
      category: "workplace",
      isVisible: isActive && isOwner,
    },
    {
      id: "banks",
      label: "Bancos",
      icon: "Landmark",
      component: <BankPageContent />,
      category: "workplace",
      isVisible: isActive,
    },
    {
      id: "agt",
      label: "AGT",
      icon: "ShieldCheck",
      component: <AgtPageContent />,
      category: "workplace",
      isVisible: isOwner,
    },
  ];

  const tabs = allTabs.filter((tab) => tab.isVisible);

  const enabledTabs = tabs.filter((tab) => !disabledTabs.includes(tab.id));
  const generalTabs = enabledTabs.filter((tab) => tab.category === "general");
  const workplaceTabs = enabledTabs.filter(
    (tab) => tab.category === "workplace",
  );

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
      ? "hover:bg-accent hover:text-foreground data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative w-full justify-start after:absolute after:inset-y-0 after:start-0 after:-ms-1 after:w-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
      : "data-[state=active]:bg-muted data-[state=active]:after:bg-primary relative overflow-hidden rounded-none border py-2 after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 first:rounded-s last:rounded-e";

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
            className={`font-normal ${activeTab === tab.id ? "text-primary" : ""}`}
          >
            {tab.label}
          </p>
        )}
      </TabsTrigger>
    );
  };

  return (
    <div data-tour="setup-layout">
      <h1 className="text-2xl font-semibold">Definições da Conta</h1>
      <div className="hidden md:block">
        <Tabs
          value={activeTab}
          className="flex-row w-full mt-5"
          onValueChange={handleTabChange}
        >
          <div className="h-screen bg-sidebar rounded-md">
            <TabsList className="sticky top-0 flex-col gap-1 px-1 font-normal bg-transparent rounded-none w-75 text-foreground">
              <div className="p-4 space-y-5">
                {generalTabs.length > 0 && (
                  <>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">
                      Gerais
                    </p>
                    <div data-tour="setup-general-tabs">
                      {generalTabs.map((tab) => renderTabTrigger(tab, true))}
                    </div>
                  </>
                )}
                {generalTabs.length > 0 && workplaceTabs.length > 0 && (
                  <div className="h-px bg-border" />
                )}
                {workplaceTabs.length > 0 && (
                  <>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">
                      Ambiente de Trabalho
                    </p>
                    <div data-tour="setup-workplace-tabs">
                      {workplaceTabs.map((tab) => renderTabTrigger(tab, true))}
                    </div>
                  </>
                )}
              </div>
            </TabsList>
          </div>

          <div className="border rounded-md grow min-w-0 text-start" data-tour="setup-active-content">
            {enabledTabs.map((tab) => (
              <TabsContent key={tab.id} value={tab.id} className="!py-4 sm:p-6">
                {tab.component}
              </TabsContent>
            ))}
          </div>
        </Tabs>
      </div>

      <div className="block mt-6 sm:mt-8 md:mt-10 md:hidden">
        <Tabs
          value={activeTab}
          className="w-full"
          onValueChange={handleTabChange}
        >
          <div className="relative -mx-4 px-4 sm:mx-0 sm:px-0">
            <TabsList className="h-auto w-full min-w-full inline-flex p-0 shadow-xs bg-background overflow-x-auto overflow-y-hidden scrollbar-hide -space-x-px rtl:space-x-reverse" data-tour="setup-general-tabs">
              {enabledTabs.map((tab) => renderTabTrigger(tab, false))}
            </TabsList>
          </div>

          <div className="mt-4 sm:mt-6" data-tour="setup-active-content">
            {enabledTabs.map((tab) => (
              <TabsContent
                key={tab.id}
                value={tab.id}
                className="focus-visible:outline-none focus-visible:ring-0"
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
