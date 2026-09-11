import { DefSetup, PageWrapper } from "@/components";

export default function SettingsPage() {
  return (
    <PageWrapper subRoute="Configurações" onboardingTourId="setup">
      <DefSetup />
    </PageWrapper>
  );
}
