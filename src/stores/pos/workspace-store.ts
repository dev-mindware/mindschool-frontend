import { create } from "zustand";
import { persist } from "zustand/middleware";

interface WorkspaceState {
  disableVirtualKeyboard: boolean;
  useThermalPrinter: boolean;
  setDisableVirtualKeyboard: (value: boolean) => void;
  setUseThermalPrinter: (value: boolean) => void;
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set) => ({
      disableVirtualKeyboard: false,
      useThermalPrinter: true,
      setDisableVirtualKeyboard: (disableVirtualKeyboard) =>
        set({ disableVirtualKeyboard }),
      setUseThermalPrinter: (useThermalPrinter) => set({ useThermalPrinter }),
    }),
    {
      name: "workspace-settings",
    },
  ),
);
