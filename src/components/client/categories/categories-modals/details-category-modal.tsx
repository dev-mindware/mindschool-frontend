"use client";
import { useModal } from "@/stores/modal/use-modal-store";
import {
  Icon,
  Button,
  DetailRow,
  GlobalModal,
  ItemStatusBadge,
} from "@/components";
import { currentCategoryStore } from "@/stores";
import { formatDateTime } from "@/utils";

export function DetailsCategoryModal() {
  const { closeModal, open } = useModal();
  const { currentCategory } = currentCategoryStore();

  if (!currentCategory) return null;

  if(!open["view-category"]) return null;

  return (
    <GlobalModal
      canClose
      id="view-category"
      title={
        <>
          <div className="flex items-center justify-center mx-auto rounded-full w-20 h-20 bg-primary/10">
            <Icon name="Tag" className="w-10 h-10 text-primary" />
          </div>

          <div className="text-center space-y-1">
            <h2 className="text-2xl font-bold">{currentCategory.name}</h2>
            <div className="flex items-center justify-center gap-2">
              <ItemStatusBadge
                status={currentCategory.isActive ? "ACTIVE" : "INACTIVE"}
              />
            </div>
          </div>
        </>
      }
      className="!max-h-[85vh] w-full max-w-md"
      footer={
        <div className="flex justify-end">
          <Button variant="outline" onClick={() => closeModal("view-category")}>
            Fechar
          </Button>
        </div>
      }
    >
      <div className="space-y-6 text-sm">
        {currentCategory.description && (
          <section className="space-y-2">
            <h3 className="font-semibold text-foreground">
              Informações Gerais
            </h3>
            <DetailRow label="Descrição" value={currentCategory.description} />
          </section>
        )}

        {currentCategory.createdAt && (
          <section className="space-y-2">
            <h3 className="font-semibold text-foreground">Validade</h3>
            <DetailRow
              label="Data de Criação"
              value={formatDateTime(currentCategory.createdAt)}
            />
          </section>
        )}
      </div>
    </GlobalModal>
  );
}
