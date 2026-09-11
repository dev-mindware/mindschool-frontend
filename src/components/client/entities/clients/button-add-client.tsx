import { Button } from "@/components/ui";
import { useModal } from "@/stores";
import { ProtectedAction } from "@/components/guards";

export function ButtonAddClient() {
  const { openModal } = useModal();

  return (
    <ProtectedAction>
      <Button
        onClick={() => openModal("add-client")}
        variant="default"
        className="w-full sm:w-auto text-sm sm:text-base"
      >
        Novo Cliente
      </Button>
    </ProtectedAction>
  );
}
