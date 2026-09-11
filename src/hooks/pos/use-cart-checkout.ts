"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateInvoiceReceipt, useCreateProforma } from "@/hooks";
import { currentStoreStore, useAuthStore } from "@/stores";
import { ErrorMessage, WarningMessage, printPosDocument } from "@/utils";
import { useInvoiceTotals, useClientSelection } from "@/hooks/invoice";
import { PosSalesFormData, PosSalesSchema } from "@/schemas";
import { ContributorVerificationStatus, DocumentType, Product } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import { useWorkspaceStore } from "@/stores/pos/workspace-store";
import { isValidAngolanTaxNumber } from "@/lib/contributor";

export interface CartItem extends Product {
  qty: number;
}

export type PaymentMethod = "Credit Card" | "Cash";

const posPhoneRegex = /^(92|99|91|95|93|94|97)\d{7}$/;

interface UseCartCheckoutProps {
  cartItems: CartItem[];
  type?: "invoice" | "proforma";
  onSuccess?: () => void;
  cashSessionId: string;
}

export function useCartCheckout({
  cartItems,
  type = "invoice",
  onSuccess,
  cashSessionId,
}: UseCartCheckoutProps) {
  const { user } = useAuthStore();
  const { currentStore } = currentStoreStore();
  const { useThermalPrinter } = useWorkspaceStore();
  const queryClient = useQueryClient();

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("Credit Card");
  const [cashGiven, setCashGiven] = useState<number | "">("");
  const [change, setChange] = useState<number>(0);

  const [isCustomerExpanded, setIsCustomerExpanded] = useState(false);
  const [newCustomerPhone, setNewCustomerPhone] = useState("");
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerTaxNumber, setNewCustomerTaxNumber] = useState("");
  const [newCustomerAddress, setNewCustomerAddress] = useState("");
  const [newCustomerVerification, setNewCustomerVerification] =
    useState<ContributorVerificationStatus>("idle");
  const [printDocument, setPrintDocument] = useState<{
    id: string;
    type: DocumentType;
  } | null>(null);
  const [isPrinting, setIsPrinting] = useState(false);

  const { mutateAsync: createInvoiceReceipt, isPending: isPendingInvoice } =
    useCreateInvoiceReceipt();
  const { mutateAsync: createProforma, isPending: isPendingProforma } =
    useCreateProforma();

  const isPending = isPendingInvoice || isPendingProforma;

  const form = useForm({
    resolver: zodResolver(PosSalesSchema),
    defaultValues: {
      issueDate: new Date().toLocaleDateString("en-CA"),
      items: [],
      client: undefined,
      clientId: "",
      storeId: currentStore?.id || user?.store?.id || "",
      total: 0,
      subtotal: 0,
      taxAmount: 0,
      discountAmount: 0,
      receivedValue: 0,
      change: 0,
      paymentMethod: "CARD",
      cashSessionId: cashSessionId || "",
    },
  });

  const { handleSubmit, setValue, watch, reset } = form;
  const {
    handleClientChange: handleBaseClientChange,
    selectedClient,
    setSelectedClient,
  } = useClientSelection(setValue);

  const handleClientChange = (option: any) => {
    handleBaseClientChange(option);

    if (option?.__isNew__) {
      setNewCustomerName(option.label || "");
      setValue("client", undefined, {
        shouldValidate: false,
        shouldDirty: true,
      });
    }
  };

  const watchedItems = watch("items") as any[];
  const totals = useInvoiceTotals({
    items: watchedItems || [],
    retention: 0,
    discount: 0, // POS não usa desconto global
  });

  // Synchronize cartItems with form items
  useEffect(() => {
    const items = cartItems.map((item) => ({
      id: item.id,
      description: item.name,
      type: "PRODUCT" as const,
      quantity: item.qty,
      unitPrice: item.price || 0,
      tax: Number((item as any).tax?.rate || (item as any).taxRate || 0), // ✅ Convert string to number
      discount: 0,
      total: (item.price || 0) * item.qty,
      isFromAPI: true,
    }));

    setValue("items", items as any, { shouldValidate: true });
  }, [cartItems, setValue]);

  // Synchronize totals to form state
  useEffect(() => {
    setValue("total", totals.total);
    setValue("subtotal", totals.subtotal);
    setValue("taxAmount", totals.taxAmount);
    setValue("discountAmount", totals.discountAmount);
  }, [totals, setValue]);

  // Synchronize payment method
  useEffect(() => {
    setValue("paymentMethod", paymentMethod === "Cash" ? "CASH" : "CARD");
  }, [paymentMethod, setValue]);

  // Synchronize storeId
  useEffect(() => {
    const id = currentStore?.id || user?.store?.id;
    if (id) setValue("storeId", id);
  }, [currentStore, user, setValue]);

  // Synchronize cashSessionId
  useEffect(() => {
    if (cashSessionId) {
      setValue("cashSessionId", cashSessionId);
    }
  }, [cashSessionId, setValue]);

  // Handle Cash & Change
  useEffect(() => {
    if (paymentMethod === "Cash") {
      const cash = typeof cashGiven === "number" ? cashGiven : 0;
      const changeVal = cash >= totals.total ? cash - totals.total : 0;
      const safeChange = isNaN(changeVal) ? 0 : Number(changeVal.toFixed(2));

      setChange(safeChange);
      setValue("receivedValue", cash);
      setValue("change", safeChange, { shouldValidate: true });
    } else {
      setChange(0);
      setValue("receivedValue", totals.total);
      setValue("change", 0, { shouldValidate: true });
    }
  }, [cashGiven, totals.total, paymentMethod, setValue]);

  const handleQuickCash = (amount: number) => {
    setCashGiven(amount);
  };

  const handleCheckout = async (data: any) => {
    if (cartItems.length === 0) {
      ErrorMessage("O carrinho está vazio!");
      return;
    }

    // Validate cashSessionId
    if (!cashSessionId) {
      ErrorMessage("Sessão de caixa não identificada. Recarregue a página.");
      console.error("cashSessionId is missing:", cashSessionId);
      return;
    }

    const normalizedNewCustomerPhone = newCustomerPhone
      .replace(/\D/g, "")
      .slice(0, 9);
    const isCreatingClient = !!selectedClient?.__isNew__;
    const hasInvalidNewPhone =
      normalizedNewCustomerPhone.length > 0 &&
      !posPhoneRegex.test(normalizedNewCustomerPhone);

    if (
      hasInvalidNewPhone ||
      (isCreatingClient && !posPhoneRegex.test(normalizedNewCustomerPhone))
    ) {
      ErrorMessage("Insira um número de telemóvel válido para o cliente.");
      return;
    }

    if (isCreatingClient && !isValidAngolanTaxNumber(newCustomerTaxNumber)) {
      ErrorMessage("Introduza um NIF válido para o novo cliente.");
      return;
    }

    if (
      isCreatingClient &&
      ["idle", "checking"].includes(newCustomerVerification)
    ) {
      ErrorMessage(
        "Aguarde pela verificação do NIF.",
      );
      return;
    }

    if (
      isCreatingClient &&
      ["not_found", "unavailable"].includes(newCustomerVerification)
    ) {
      WarningMessage(
        "A factura será criada, mas se o NIF não existir a AGT poderá não validar o documento.",
      );
    }

    // Prepare payload
    const simplifiedItems = data.items.map((item: any) => ({
      id: item.id,
      quantity: item.quantity,
    }));

    const payload: PosSalesFormData = {
      issueDate: data.issueDate,
      items: simplifiedItems,
      client: data.client,
      total: data.total,
      subtotal: data.subtotal,
      taxAmount: data.taxAmount,
      discountAmount: data.discountAmount,
      receivedValue: data.receivedValue,
      paymentMethod: data.paymentMethod,
      storeId: currentStore?.id || user?.store?.id || data.storeId,
      change:
        typeof data.change === "number" && !isNaN(data.change)
          ? Number(data.change.toFixed(2))
          : 0,
      cashSessionId,
    };

    if (!payload.storeId) {
      ErrorMessage("Loja não identificada. Recarregue a página.");
      return;
    }

    // Custom adjustments for client
    if (data.clientId) {
      payload.client = {
        id: data.clientId,
      } as PosSalesFormData["client"];
    } else if (selectedClient?.__isNew__) {
      payload.client = {
        name: newCustomerName || selectedClient.label,
        phone: normalizedNewCustomerPhone,
        address: undefined,
        taxNumber: newCustomerTaxNumber,
      };
    } else if (!selectedClient && normalizedNewCustomerPhone) {
      payload.client = {
        name: "Consumidor Final",
        phone: normalizedNewCustomerPhone,
        email: "consumidor@final.com",
        address: "Loja",
        taxNumber: "999999999",
      };
    }

    await performSubmit(payload);
  };

  const performSubmit = async (payload: PosSalesFormData) => {
    try {
      if (type === "invoice") {
        const response = await createInvoiceReceipt(payload as any);
        const invoiceId = response?.data?.id;

        if (invoiceId) {
          setPrintDocument({
            id: invoiceId,
            type: "invoice-receipt",
          });
        }
      } else {
        // Remove payment-specific fields for proforma
        const { cashSessionId, change, receivedValue, ...proformaData } =
          payload;

        const proformaPayload = {
          ...proformaData,
          proformaExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
        };
        const response = await createProforma(proformaPayload as any);
        const proformaId = response?.data?.id;

        if (proformaId) {
          setPrintDocument({
            id: proformaId,
            type: "proforma",
          });
        }
      }

      setCashGiven("");
      setSelectedClient(null);
      setNewCustomerPhone("");
      setNewCustomerName("");
      setNewCustomerTaxNumber("");
      setNewCustomerAddress("");
      setNewCustomerVerification("idle");
      reset({
        issueDate: new Date().toLocaleDateString("en-CA"),
        items: [],
        client: undefined,
        clientId: "",
        storeId: currentStore?.id || user?.store?.id || "",
        total: 0,
        subtotal: 0,
        taxAmount: 0,
        discountAmount: 0,
        receivedValue: 0,
        change: 0,
        paymentMethod: "CARD",
        cashSessionId,
      });
      onSuccess?.();

      // Invalidate items queries so stock quantities update without page refresh
      // useFetch stores keys as single strings (e.g. "items-for-pos-search-cat-type"),
      // so we must use a predicate to match all variants
      queryClient.invalidateQueries({
        predicate: (query) =>
          typeof query.queryKey[0] === "string" &&
          (query.queryKey[0] as string).startsWith("items-for-pos"),
      });
      queryClient.invalidateQueries({ queryKey: ["items-paginated"] });
      queryClient.invalidateQueries({ queryKey: ["stocks"] });
    } catch (error: any) {
      if (error?.response?.data?.message) {
        ErrorMessage(error?.response?.data?.message);
        return;
      } else {
        ErrorMessage(
          `Erro ao processar ${type === "invoice" ? "o pagamento" : "a proforma"}.`,
        );
      }
    }
  };

  const handlePrint = async () => {
    if (!printDocument || isPrinting) return;

    setIsPrinting(true);
    try {
      await printPosDocument({
        ...printDocument,
        thermal: useThermalPrinter,
      });
      setPrintDocument(null);
    } catch (error) {
      console.error("Erro ao imprimir o documento:", error);
      ErrorMessage("Não foi possível imprimir o documento. Tente novamente.");
    } finally {
      setIsPrinting(false);
    }
  };

  const dismissPrint = () => {
    if (!isPrinting) setPrintDocument(null);
  };

  return {
    form,
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
  };
}
