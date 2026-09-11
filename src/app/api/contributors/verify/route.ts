import { NextRequest, NextResponse } from "next/server";
import {
  isValidAngolanTaxNumber,
  normalizeTaxNumber,
} from "@/lib/contributor";
import type {
  ContributorErrorCode,
} from "@/types/contributor";
import { getContributorByDocument } from "@/services/setic/setic-client";
import { mapSeticToVerifiedContributor } from "@/services/setic/setic.mapper";
import type { DocumentType } from "@/services/setic/setic.types";

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 20;
const rateLimits = new Map<string, { count: number; expiresAt: number }>();

export const runtime = "nodejs";

function errorResponse(message: string, code: ContributorErrorCode, status: number) {
  return NextResponse.json(
    { message, code },
    {
      status,
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
    },
  );
}

function isAllowedOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return process.env.NODE_ENV === "test";

  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL;
  const allowedOrigins = new Set([request.nextUrl.origin]);
  if (configuredUrl) {
    try {
      allowedOrigins.add(new URL(configuredUrl).origin);
    } catch {
      return false;
    }
  }

  try {
    return allowedOrigins.has(new URL(origin).origin);
  } catch {
    return false;
  }
}

function getClientAddress(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const current = rateLimits.get(key);

  if (!current || current.expiresAt <= now) {
    rateLimits.set(key, { count: 1, expiresAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  current.count += 1;
  return current.count > RATE_LIMIT_MAX_REQUESTS;
}

const allowedDocumentTypes = [
  "NIF",
  "AID",
  "REF",
  "RES",
  "BCER",
  "PASS",
  "FID",
  "ONIF",
  "OTHR",
] as const;

function isValidDocumentType(value: string): value is DocumentType {
  return allowedDocumentTypes.includes(value as DocumentType);
}

export async function POST(request: NextRequest) {
  if (!isAllowedOrigin(request)) {
    return errorResponse("Origem não autorizada.", "UPSTREAM_ERROR", 403);
  }

  if (isRateLimited(getClientAddress(request))) {
    return errorResponse(
      "Foram efectuadas demasiadas consultas. Aguarde um momento.",
      "RATE_LIMITED",
      429,
    );
  }

  let body: { taxNumber?: unknown; tipoDocumento?: unknown; numeroDocumento?: unknown };
  try {
    body = await request.json();
  } catch {
    return errorResponse("O pedido é inválido.", "INVALID_TAX_NUMBER", 400);
  }

  const tipoDocumento = String(body.tipoDocumento || "NIF").trim();
  const numeroDocumento = normalizeTaxNumber(
    String(body.numeroDocumento || body.taxNumber || "")
  );

  if (!numeroDocumento) {
    return errorResponse("O número do documento é obrigatório.", "INVALID_TAX_NUMBER", 400);
  }

  if (!isValidDocumentType(tipoDocumento)) {
    return errorResponse("Tipo de documento inválido.", "INVALID_TAX_NUMBER", 400);
  }

  if (tipoDocumento === "NIF" && !isValidAngolanTaxNumber(numeroDocumento)) {
    return errorResponse("O NIF introduzido é inválido.", "INVALID_TAX_NUMBER", 400);
  }

  const baseUrl = process.env.SIGT_BASE_URL;
  const username = process.env.SIGT_USERNAME;
  const password = process.env.SIGT_PASSWORD;
  if (!baseUrl || !username || !password) {
    console.error("Configuração do serviço incompleta.");
    return errorResponse(
      "Não foi possível comunicar com o serviço SETIC-FP. Verifique URL, DNS, VPN, whitelist ou disponibilidade do serviço.",
      "SERVICE_UNAVAILABLE",
      503,
    );
  }

  try {
    const data = await getContributorByDocument({
      tipoDocumento,
      numeroDocumento,
    });

    const contributor = data.ObterContribuinte?.contribuinte;
    if (!contributor) {
      return errorResponse(
        "Não foi encontrado um contribuinte com este documento.",
        "TAXPAYER_NOT_FOUND",
        404,
      );
    }

    const verified = mapSeticToVerifiedContributor(contributor);

    // Hybrid response to support both old and new consumers
    return NextResponse.json(
      {
        ...verified,
        message: data.ObterContribuinte.mensagem || "Consulta realizada com sucesso.",
        contributor,
      },
      {
        headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
      }
    );
  } catch (error) {
    console.error("[SETIC-FP] Falha de comunicação:", error);

    const message = error instanceof Error ? error.message : "Erro desconhecido.";
    const errorName =
      error instanceof Error
        ? error.name
        : typeof error === "object" && error !== null && "name" in error
          ? String((error as { name?: unknown }).name || "")
          : "";
    const errorText = String(error);

    if (message.includes("404")) {
      return errorResponse(
        "Não foi encontrado um contribuinte com este documento.",
        "TAXPAYER_NOT_FOUND",
        404,
      );
    }

    if (message.includes("401") || message.includes("403")) {
      return errorResponse(
        "O acesso ao serviço fiscal não está autorizado. Confirme as credenciais e a autorização do ambiente SETIC-FP.",
        "SERVICE_UNAVAILABLE",
        503,
      );
    }

    if (message.includes("429")) {
      return errorResponse(
        "O limite de consultas ao serviço fiscal foi atingido.",
        "RATE_LIMITED",
        429,
      );
    }

    if (
      message.includes("ENOTFOUND") ||
      message.includes("EAI_AGAIN") ||
      message.includes("fetch failed") ||
      message.includes("aborted") ||
      errorText.includes("AbortError") ||
      errorName === "AbortError" ||
      message.includes("timeout") ||
      message.includes("502") ||
      message.includes("503")
    ) {
      return errorResponse(
        "Não foi possível comunicar com o serviço SETIC-FP. Verifique URL, DNS, VPN, whitelist ou disponibilidade do serviço.",
        "SERVICE_UNAVAILABLE",
        503,
      );
    }

    return errorResponse(
      "Erro ao consultar contribuinte.",
      "UPSTREAM_ERROR",
      500,
    );
  }
}

export async function GET() {
  return errorResponse("Método não permitido.", "UPSTREAM_ERROR", 405);
}
