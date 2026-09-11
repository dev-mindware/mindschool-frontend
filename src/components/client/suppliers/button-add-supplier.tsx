import { Button } from "@/components/ui";
import { useModal } from "@/stores";
import { ProtectedAction } from "@/components/guards";

export function ButtonAddSupplier() {
  const { openModal } = useModal();

  return (
    <ProtectedAction>
      <Button
        onClick={() => openModal("add-supplier")}
        variant="default"
        className="w-full sm:w-auto text-sm sm:text-base"
      >
        Novo Fornecedor
      </Button>
    </ProtectedAction>
  );
}
