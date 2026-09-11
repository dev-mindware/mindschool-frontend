type OriginalItem = {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  /** Taxa de imposto do item, em percentagem (ex.: 14 para 14%). */
  tax?: number;
};

type CorrectedItem = {
  id: string;
  name?: string;
  quantity: number;
  price: number;
  /** Taxa de imposto do item, em percentagem (ex.: 14 para 14%). */
  tax?: number;
};

type CorrectionTotalsInput = {
  items: OriginalItem[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
};

/**
 * Calcula a correcção/rectificação de uma factura e o respectivo crédito.
 *
 * Imposto por item (art. 10.º n.º 2 do D.P. 71/25): cada item usa a sua própria
 * taxa quando disponível; na sua ausência (ex.: backend ainda não a devolve por
 * item) recai-se na taxa global da factura original, preservando o comportamento.
 */
export function calculateCreditNoteCorrection(
  original: CorrectionTotalsInput,
  correctedItems: CorrectedItem[],
) {
  const base = original.subtotal || 1;
  const fallbackTaxRate = original.taxAmount / base;
  const discountRate = original.discountAmount / base;

  // Fracção de imposto (0-1) de um item: usa a taxa do próprio item, se houver.
  const rateOf = (item?: { tax?: number }) =>
    item?.tax != null ? Number(item.tax) / 100 : fallbackTaxRate;

  const correctedSubtotal = correctedItems.reduce(
    (total, item) => total + Number(item.quantity || 0) * Number(item.price || 0),
    0,
  );
  const correctedTax = correctedItems.reduce(
    (total, item) =>
      total + Number(item.quantity || 0) * Number(item.price || 0) * rateOf(item),
    0,
  );
  const correctedDiscount = correctedSubtotal * discountRate;
  const correctedTotal = correctedSubtotal + correctedTax - correctedDiscount;

  const allItemIds = new Set([
    ...original.items.map(({ id }) => id),
    ...correctedItems.map(({ id }) => id),
  ]);
  const deltaItems = Array.from(allItemIds).map((itemId) => {
    const item = correctedItems.find(({ id }) => id === itemId);
    const originalItem = original.items.find(({ id }) => id === itemId);
    const rate = rateOf(item ?? originalItem);
    const originalPrice = Number(originalItem?.unitPrice || 0);
    const originalQuantity = Number(originalItem?.quantity || 0);
    const originalTotal = originalPrice * originalQuantity;
    const newPrice = Number(item?.price || 0);
    const newQuantity = Number(item?.quantity || 0);
    const newTotal = newPrice * newQuantity;

    return {
      id: itemId,
      itemsId: itemId,
      itemName: item?.name || originalItem?.name || "Item",
      originalPrice,
      newPrice,
      originalQuantity,
      quantity: newQuantity,
      originalTotal,
      newTotal,
      originalTaxAmount: originalTotal * rate,
      newTaxAmount: newTotal * rate,
    };
  });

  const originalTaxComputed = deltaItems.reduce(
    (total, item) => total + item.originalTaxAmount,
    0,
  );

  // Subtotal original calculado a partir dos itens (preço × quantidade), e não
  // do `original.subtotal` guardado — que pode estar desactualizado e diverge
  // da soma dos itens, fazendo o backend rejeitar a validação de cálculos.
  const originalSubtotal = original.items.reduce(
    (total, item) =>
      total + Number(item.unitPrice || 0) * Number(item.quantity || 0),
    0,
  );

  const creditSubtotal = Math.max(0, originalSubtotal - correctedSubtotal);
  const creditTax = Math.max(0, originalTaxComputed - correctedTax);
  const creditDiscount = creditSubtotal * discountRate;
  const creditTotal = creditSubtotal + creditTax - creditDiscount;

  return {
    invoiceBody: {
      subtotal: Number(correctedSubtotal.toFixed(2)),
      taxAmount: Number(correctedTax.toFixed(2)),
      discountAmount: Number(correctedDiscount.toFixed(2)),
      total: Number(correctedTotal.toFixed(2)),
    },
    creditNote: {
      subtotal: Number(creditSubtotal.toFixed(2)),
      taxAmount: Number(creditTax.toFixed(2)),
      discountAmount: Number(creditDiscount.toFixed(2)),
      total: Number(creditTotal.toFixed(2)),
      items: deltaItems,
    },
  };
}
