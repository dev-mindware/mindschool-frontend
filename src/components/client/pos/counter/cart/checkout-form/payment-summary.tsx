import { formatCurrency } from "@/utils";
import { PaymentMethod } from "@/hooks";

interface PaymentSummaryProps {
    subtotal: number;
    taxAmount?: number;
    discountAmount?: number;
    total: number;
    change: number;
    paymentMethod: PaymentMethod;
}

export function PaymentSummary({
    subtotal,
    taxAmount = 0,
    discountAmount = 0,
    total,
    change,
    paymentMethod
}: PaymentSummaryProps) {
    return (
        <div data-tour="pos-payment-summary">
            <h3 className="font-bold mb-3">Resumo de Pagamento</h3>

            <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Subtotal</span>
                    <span className="font-medium text-foreground">
                        {formatCurrency(subtotal)}
                    </span>
                </div>

                {taxAmount > 0 && (
                    <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Impostos</span>
                        <span className="font-medium text-foreground">
                            {formatCurrency(taxAmount)}
                        </span>
                    </div>
                )}

                {discountAmount > 0 && (
                    <div className="flex justify-between text-sm text-orange-600">
                        <span>Desconto</span>
                        <span className="font-semibold">
                            -{formatCurrency(discountAmount)}
                        </span>
                    </div>
                )}

                {change > 0 && paymentMethod === "Cash" && (
                    <div className="flex justify-between text-sm text-green-600 font-semibold">
                        <span>Troco</span>
                        <span>{formatCurrency(change)}</span>
                    </div>
                )}
            </div>

            <div className="flex justify-between items-center text-base font-bold mb-6 border-t border-dashed pt-2">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
            </div>
        </div>
    );
}
