import type {
  ListContributorsInput,
  SeticGetContributorResponse,
  SeticListContributorsResponse,
  VerifyContributorInput,
} from "./setic.types";

const BASE_URL = process.env.SIGT_BASE_URL;
const USERNAME = process.env.SIGT_USERNAME;
const PASSWORD = process.env.SIGT_PASSWORD;
const TIMEOUT_MS = Number(process.env.SIGT_REQUEST_TIMEOUT_MS ?? 10000);

function validateConfig() {
  if (!BASE_URL || !USERNAME || !PASSWORD) {
    throw new Error("Configuração SETIC-FP incompleta.");
  }
}

function buildAuthHeader(): string {
  const credentials = `${USERNAME}:${PASSWORD}`;
  return `Basic ${Buffer.from(credentials).toString("base64")}`;
}

async function seticFetch<T>(url: URL): Promise<T> {
  validateConfig();

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: buildAuthHeader(),
      },
      signal: controller.signal,
      cache: "no-store",
    });

    const contentType = response.headers.get("content-type") ?? "";

    if (!response.ok) {
      const body = await response.text();
      throw new Error(
        `SETIC-FP respondeu com erro ${response.status}: ${body}`
      );
    }

    if (!contentType.includes("application/json")) {
      const body = await response.text();
      throw new Error(
        `Resposta inesperada da SETIC-FP. Content-Type: ${contentType}. Body: ${body}`
      );
    }

    return response.json();
  } finally {
    clearTimeout(timeout);
  }
}

export async function getContributorByDocument(
  input: VerifyContributorInput
): Promise<SeticGetContributorResponse> {
  const cleanBase = (BASE_URL || "").replace(/\/$/, "");
  const url = new URL(`${cleanBase}/v5/obter`);

  url.searchParams.set("tipoDocumento", input.tipoDocumento);
  url.searchParams.set("numeroDocumento", input.numeroDocumento);

  return seticFetch<SeticGetContributorResponse>(url);
}

export async function listContributorsByPeriod(
  input: ListContributorsInput
): Promise<SeticListContributorsResponse> {
  const cleanBase = (BASE_URL || "").replace(/\/$/, "");
  const url = new URL(`${cleanBase}/v5/listar`);

  url.searchParams.set("dataInicio", input.dataInicio);
  url.searchParams.set("dataFim", input.dataFim);

  return seticFetch<SeticListContributorsResponse>(url);
}
