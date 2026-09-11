import { Method } from "@/types";

type Props = {
  currentMethod: Method;
};

export function PaymentInstruction({ currentMethod }: Props) {
  return (
    <div className="bg-primary-50 dark:bg-primary-900/10 p-4 rounded-lg">
      <h4 className="font-semibold text-primary-800 dark:text-primary-200 mb-2">
        Instruções para Pagamento:
      </h4>
      <div className="text-sm text-primary-700 dark:text-primary-300 space-y-1">
        <p>
          1. Realize o pagamento de
          através do método{" "}
          {currentMethod.name}
        </p>
        <p>2. Baixe o PDF do comprovativo</p>
        <p>3. Envie o ficheiro através do campo acima.</p>
        <p>4. Aguarde a aprovação do pagamento</p>
      </div>
    </div>
  );
}
