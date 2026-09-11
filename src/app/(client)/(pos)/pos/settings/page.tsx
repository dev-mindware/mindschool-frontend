"use client";
import { PageWrapper } from "@/components";
import { PosSettingsSetup } from "@/components/client/pos";
import { MobilePosPageLayout } from "@/components/client/pos/mobile";
import { useIsMobile } from "@/hooks/use-mobile";

export default function PosSettingsPage() {
    const isMobile = useIsMobile();

    if (isMobile) {
        return (
            <MobilePosPageLayout activeTab="profile" title="Configurações">
                <PosSettingsSetup showTourButton />
            </MobilePosPageLayout>
        );
    }

    return (
        <PageWrapper subRoute="pos" variant="counter" onboardingTourId="pos-settings">
            <PosSettingsSetup />
        </PageWrapper>
    );
}
