import { create } from "zustand";

interface EntitiesStore<T> {
  currentEntity: T | null;
  setCurrentEntity: (entity: T | null) => void;
  clearCurrentEntity: () => void;
}

export const createEntitiesStore = <T,>() => {
  return create<EntitiesStore<T>>((set) => ({
    currentEntity: null,
    setCurrentEntity: (entity) => set({ currentEntity: entity }),
    clearCurrentEntity: () => set({ currentEntity: null }),
  }));
};

// Exemplo de uso para diferentes entidades:
// export const useClientStore = createEntitiesStore<ClientData>();
// export const useProductStore = createEntitiesStore<ProductData>();
// export const useOrderStore = createEntitiesStore<OrderData>();