"use client";
import { PageWrapper, AllNotifications } from "@/components";
import { MobilePosPageLayout } from "@/components/client/pos/mobile";
import { NotificationDetail } from "@/components/shared/notifications";
import { useIsMobile } from "@/hooks/use-mobile";

export default function PosNotificationsPage() {
    const isMobile = useIsMobile();

    if (isMobile) {
        return (
            <MobilePosPageLayout activeTab="notifications" title="Notificações">
                <div className="p-4 space-y-6">
                    <AllNotifications />
                </div>
                <NotificationDetail />
            </MobilePosPageLayout>
        );
    }

    return (
        <PageWrapper subRoute="pos" variant="counter">
            <div className="space-y-6">
                <AllNotifications />
            </div>
        </PageWrapper>
    );
}
