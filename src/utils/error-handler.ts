import { AxiosError } from "axios";

/**
 * Extrai uma mensagem de erro legível de qualquer tipo de erro Axios/API/Rede.
 *
 * Suporta:
 * - Erros do NestJS com message como string
 * - Erros do NestJS ValidationPipe com message como string[]
 * - Erros de rede (sem resposta)
 * - Erros de timeout
 * - Erros genéricos de JavaScript
 */
export function extractErrorMessage(
  error: unknown,
  fallback = "Ocorreu um erro inesperado. Tente novamente."
): string {
  if (!error) return fallback;

  const axiosError = error as AxiosError<{
    message?: string | string[];
    error?: string;
    statusCode?: number;
  }>;

  // Erro de rede / sem resposta do servidor
  if (!axiosError.response) {
    if (
      axiosError.code === "ECONNABORTED" ||
      axiosError.message?.toLowerCase().includes("timeout")
    ) {
      return "O servidor demorou muito a responder. Verifique a sua ligação à internet e tente novamente.";
    }
    if (
      axiosError.message?.toLowerCase().includes("network") ||
      axiosError.message?.toLowerCase().includes("failed")
    ) {
      return "Falha na ligação ao servidor. Verifique a sua internet e tente novamente.";
    }
    if (axiosError.message) return axiosError.message;
    return fallback;
  }

  const { status, data } = axiosError.response;

  // Trata erros HTTP por código de status
  switch (status) {
    case 401:
      return "A sua sessão expirou. Por favor, inicie sessão novamente.";
    case 403:
      if (typeof data?.message === "string" && data.message.length > 0) {
        return data.message;
      }
      return "Não tem permissão para realizar esta operação.";
    case 404:
      if (typeof data?.message === "string" && data.message.length > 0) {
        return data.message;
      }
      return "O registo solicitado não foi encontrado.";
    case 429:
      return "Demasiadas tentativas. Aguarde alguns instantes antes de tentar novamente.";
    case 500:
    case 502:
    case 503:
      return "O servidor encontrou um problema interno. Tente novamente mais tarde ou contacte o suporte.";
  }

  // Extrai a mensagem do corpo da resposta
  if (!data) return fallback;

  const rawMessage = data.message;

  if (Array.isArray(rawMessage) && rawMessage.length > 0) {
    // NestJS ValidationPipe retorna arrays de erros — junta-os em texto legível
    return rawMessage.join(" | ");
  }

  if (typeof rawMessage === "string" && rawMessage.trim().length > 0) {
    return rawMessage;
  }

  return fallback;
}

/**
 * Converte uma resposta de erro da API num Record de erros por campo,
 * compatível com o setError() do React Hook Form.
 *
 * Analisa o array de mensagens do NestJS e tenta identificar o campo
 * a partir do prefixo da mensagem (ex: "O campo 'price' deve ser...").
 */
export function extractFieldErrors(
  error: unknown
): Record<string, string> | null {
  const axiosError = error as AxiosError<{ message?: string | string[] }>;
  const rawMessage = axiosError?.response?.data?.message;

  if (!Array.isArray(rawMessage) || rawMessage.length === 0) return null;

  const fieldMap: Record<string, string> = {};

  const fieldMappings: Record<string, string> = {
    name: "name",
    nome: "name",
    price: "price",
    preço: "price",
    cost: "cost",
    custo: "cost",
    barcode: "barcode",
    "código de barras": "barcode",
    sku: "sku",
    category: "categoryId",
    categoria: "categoryId",
    tax: "taxId",
    imposto: "taxId",
    supplier: "supplierId",
    fornecedor: "supplierId",
    weight: "weight",
    peso: "weight",
    dimensions: "dimensions",
    dimensões: "dimensions",
    expiry: "expiryDate",
    validade: "expiryDate",
    description: "description",
    descrição: "description",
    quantity: "quantity",
    quantidade: "quantity",
    minStock: "minStock",
    unit: "unit",
    unidade: "unit",
  };

  rawMessage.forEach((msg) => {
    const lowerMsg = msg.toLowerCase();
    for (const [keyword, fieldName] of Object.entries(fieldMappings)) {
      if (lowerMsg.includes(keyword)) {
        if (!fieldMap[fieldName]) {
          fieldMap[fieldName] = msg;
        }
        break;
      }
    }
  });

  return Object.keys(fieldMap).length > 0 ? fieldMap : null;
}
