import type { ReactNode } from "react";
import { icons } from "lucide-react";

export type DefinitionTabItem = {
  id: string;
  label: string;
  description: string;
  icon: keyof typeof icons;
  component: ReactNode;
  category: "general" | "workplace";
  isVisible: boolean;
};

export interface DefSetupProps {
  disabledTabs?: string[];
}

