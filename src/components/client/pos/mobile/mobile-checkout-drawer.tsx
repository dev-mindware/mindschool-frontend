"use client";

import { useCartCheckout, CartItem } from "@/hooks";
import { 
  Drawer, 
  DrawerContent, 
  DrawerHeader, 
  DrawerTitle, 
  DrawerFooter,
  Button,
  Icon
} from "@/components";
import { PaymentSummary } from "../counter/cart/checkout-form/payment-summary";
import { CustomerSelection } from "../counter/cart/checkout-form/customer-selection";
import { PaymentMethods } from "../counter/cart/checkout-form/payment-methods";
import { ErrorMessage } from "@/utils";
import { PrintSaleDialog } from "../counter/cart/checkout-form/print-sale-dialog";

interface MobileCheckoutDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cartItems: CartItem[];
  onSuccess?: () => void;
  type?: "invoice" | "proforma";
  cashSessionId: string;
}

export function MobileCheckoutDrawer({
  open,
  onOpenChange,
  cartItems,
  onSuccess,
  type = "invoice",
  cashSessionId
}: MobileCheckoutDrawerProps) {
  const {
    form: { handleSubmit },
    paymentMethod,
    setPaymentMethod,
    cashGiven,
    setCashGiven,
    change,
    totals,
    isCustomerExpanded,
    setIsCustomerExpanded,
    newCustomerPhone,
    setNewCustomerPhone,
    newCustomerName,
    setNewCustomerName,
    newCustomerTaxNumber,
    setNewCustomerTaxNumber,
    newCustomerAddress,
    setNewCustomerAddress,
    setNewCustomerVerification,
    selectedClient,
    handleClientChange,
    handleQuickCash,
    handleCheckout,
    printDocument,
    handlePrint,
    dismissPrint,
    isPrinting,
    isPending,
  } = useCartCheckout({ cartItems, type, onSuccess: () => {
    onSuccess?.();
    onOpenChange(false);
  }, cashSessionId });

  const handleValidationError = (errors: any) => {
    console.error("Form Validation Errors:", errors);

    if (errors?.items) {
      ErrorMessage("Adicione pelo menos um produto ao carrinho antes de criar a factura-recibo.");
      return;
    }

    ErrorMessage("Verifique os campos obrigatórios.");
  };

  return (
    <>
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader>
            <DrawerTitle>Finalizar transacção</DrawerTitle>
          </DrawerHeader>
          
          <div className="px-4 overflow-y-auto pb-4 space-y-6" data-tour="pos-checkout">
            <PaymentSummary
                subtotal={totals.subtotal}
                taxAmount={totals.taxAmount}
                discountAmount={totals.discountAmount}
                total={totals.total}
                change={change}
                paymentMethod={paymentMethod}
            />

            <CustomerSelection
                isExpanded={isCustomerExpanded}
                onToggleExpand={() => setIsCustomerExpanded(!isCustomerExpanded)}
                selectedClient={selectedClient}
                onClientChange={handleClientChange}
                newCustomerPhone={newCustomerPhone}
                onPhoneChange={setNewCustomerPhone}
                newCustomerName={newCustomerName}
                onNameChange={setNewCustomerName}
                newCustomerTaxNumber={newCustomerTaxNumber}
                onTaxNumberChange={setNewCustomerTaxNumber}
                newCustomerAddress={newCustomerAddress}
                onAddressChange={setNewCustomerAddress}
                onVerificationStatusChange={setNewCustomerVerification}
            />

            <PaymentMethods
                paymentMethod={paymentMethod}
                onMethodChange={setPaymentMethod}
                cashGiven={cashGiven}
                onCashChange={setCashGiven}
                onQuickCash={handleQuickCash}
                change={change}
            />
          </div>

          <DrawerFooter className="pt-0">
            <Button
                className="w-full h-12 text-base font-bold"
                onClick={handleSubmit(handleCheckout, handleValidationError)}
                disabled={isPending}
                data-tour="pos-submit"
            >
                {isPending ? "A processar..." : "Confirmar pagamento"}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <PrintSaleDialog
        document={printDocument}
        isPrinting={isPrinting}
        onPrint={handlePrint}
        onDismiss={dismissPrint}
      />
    </>
  );
}
