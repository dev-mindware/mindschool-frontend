"use client";

import { createContext, useContext, ReactNode, useCallback } from "react";
import { useModal } from "@/stores/modal/use-modal-store";
import { UPGRADE_PLAN_MODAL_ID } from "@/components/common/modal/upgrade-plan-modal";

interface FeatureGateContextType {
  openUpgradeModal: () => void;
}

const FeatureGateContext = createContext<FeatureGateContextType | undefined>(
  undefined,
);

export function FeatureGateProviderContext({
  children,
}: {
  children: ReactNode;
}) {
  const { openModal } = useModal();

  const openUpgradeModal = useCallback(() => {
    openModal(UPGRADE_PLAN_MODAL_ID);
  }, [openModal]);

  return (
    <FeatureGateContext.Provider value={{ openUpgradeModal }}>
      {children}
    </FeatureGateContext.Provider>
  );
}

export function useFeatureGate() {
  const context = useContext(FeatureGateContext);
  if (context === undefined) {
    throw new Error("useFeatureGate must be used within a FeatureGateProvider");
  }
  return context;
}
