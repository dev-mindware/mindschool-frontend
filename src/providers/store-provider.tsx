"use client";

import { useEffect, ReactNode } from "react";
import { useAuth } from "@/hooks/auth";
import { useGetStores, useSwitchStore } from "@/hooks/entities";
import { currentStoreStore } from "@/stores/store/current-store-store";
import { Role } from "@/types";

interface StoreProviderProps {
    children: ReactNode;
}

import { usePathname } from "next/navigation";

export function StoreProvider({ children }: StoreProviderProps) {
    const { user } = useAuth();
    const pathname = usePathname();
    const currentStore = currentStoreStore((state) => state.currentStore);

    const isAuthPage = pathname?.includes("/auth/");
    const { storesData } = useGetStores(user?.role as Role, !isAuthPage && !!user);
    const { mutate: switchStore, isPending: isSwitching } = useSwitchStore();

    const setCurrentStore = currentStoreStore((state) => state.setCurrentStore);

    useEffect(() => {
        if (!user) {
            setCurrentStore(undefined);
            return;
        }

        if (isAuthPage || !storesData || storesData.length === 0 || isSwitching) return;

        // If no store is selected, select the first one
        if (!currentStore) {
            switchStore(storesData[0]);
            return;
        }

        // If the selected store is not in the user's list, select the first one
        const isCurrentStoreValid = storesData.some((store) => store.id === currentStore.id);
        if (!isCurrentStoreValid) {
            switchStore(storesData[0]);
            return;
        }

        // If the user has only one store (like a cashier), ensure it's correctly selected if different
        if (storesData.length === 1 && currentStore.id !== storesData[0].id) {
            switchStore(storesData[0]);
        }
    }, [storesData, currentStore, switchStore, user, isAuthPage, isSwitching, setCurrentStore]);

    return <>{children}</>;
}
