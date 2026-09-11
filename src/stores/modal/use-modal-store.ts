import { create } from "zustand";

interface ModalState {
  open: Record<string, boolean>;
  modalData: Record<string, any>;
  openModal: (id: string, data?: any) => void;
  closeModal: (id: string) => void;
  toggleModal: (id: string) => void;
}

export const useModal = create<ModalState>((set) => ({
  open: {},
  modalData: {},

  openModal: (id, data) =>
    set((state) => ({
      open: { ...state.open, [id]: true },
      modalData: { ...state.modalData, [id]: data },
    })),

  closeModal: (id) =>
    set((state) => ({
      open: { ...state.open, [id]: false },
      modalData: { ...state.modalData, [id]: undefined },
    })),

  toggleModal: (id) =>
    set((state) => ({
      open: { ...state.open, [id]: !state.open[id] },
    })),
}));
