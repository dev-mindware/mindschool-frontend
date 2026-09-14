import { DefSetup, PageWrapper } from "@/components";

export default function SettingsPage() {
  return (
    <PageWrapper
      routePath="/settings"
      routeLabel="Definições"
      subRoute="Configurações Gerais"
      onboardingTourId="setup"
    >
      <DefSetup />
    </PageWrapper>
  );
}
