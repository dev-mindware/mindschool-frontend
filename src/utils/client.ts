const FINAL_CONSUMER_TAX_NUMBER = "999999999";

type ClientLike = {
  taxNumber?: string | null;
  nif?: string | null;
  clientTaxNumber?: string | null;
};

export function isFinalConsumerClient(client: ClientLike): boolean {
  const taxNumber =
    client.taxNumber || client.nif || client.clientTaxNumber || undefined;

  if (taxNumber) {
    return taxNumber.replace(/\s/g, "") === FINAL_CONSUMER_TAX_NUMBER;
  }

  return false;
}

export function excludeFinalConsumer<T extends ClientLike>(clients: T[]): T[] {
  return clients.filter((client) => !isFinalConsumerClient(client));
}

export function isSelectableClient(client: ClientLike): boolean {
  return !isFinalConsumerClient(client);
}
