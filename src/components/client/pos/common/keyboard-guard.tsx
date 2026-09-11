"use client";

import { KeyboardProvider } from "@/contexts";
import { VirtualKeyboard } from "@/components/common/virtual-keyboard";
import { useWorkspaceStore } from "@/stores/pos/workspace-store";
import { useIsMobile } from "@/hooks";

export function KeyboardGuard({ children }: { children: React.ReactNode }) {
    const { disableVirtualKeyboard } = useWorkspaceStore();
    const isMobile = useIsMobile();

    // Em mobile o teclado virtual está sempre desabilitado
    if (disableVirtualKeyboard || isMobile) {
        return <>{children}</>;
    }

    return (
        <KeyboardProvider>
            {children}
            <VirtualKeyboard />
        </KeyboardProvider>
    );
}
