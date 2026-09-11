import { Icon } from "@/components/common";
import { Method } from "@/types";
import { formatCurrency } from "@/utils";
import { SucessMessage } from "@/utils/messages";

type Props = {
  currentMethod: Method;
};

export function PaymentMethodInformation({ currentMethod }: Props) {
  return (
    <div className="bg-primary-50 dark:bg-primary-900/10 p-4 rounded-lg">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-primary-100 dark:bg-primary-900/20 rounded-lg h-14 w-14 flex items-center justify-center">
          <img
            src={`/${currentMethod.icon}`}
            className="w-full h-full object-contain drop-shadow-sm"
            alt={currentMethod.name}
          />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-primary-900 dark:text-primary-100">
              {currentMethod.reference}
            </h3>
            <button
              onClick={() => {
                navigator.clipboard.writeText(currentMethod.reference);
                SucessMessage("Copiado para a área de transferência");
              }}
              className="p-1 hover:bg-primary-200 cursor-pointer dark:hover:bg-primary-800 rounded-md transition-colors text-primary-600 dark:text-primary-400"
              title="Copiar referência"
            >
              <Icon name="Copy" className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-4 text-xs text-blue-700 dark:text-blue-300">
            <span>
              <strong>Tempo:</strong> {currentMethod.processingTime}
            </span>
            <span>
              <strong>Taxa:</strong> 0
            </span>
            <span>
              <strong>Proprietário:</strong> {currentMethod.owner}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
