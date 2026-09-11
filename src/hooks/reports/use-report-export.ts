"use client";

import { useMutation } from "@tanstack/react-query";
import axios, { type AxiosResponse } from "axios";
import { reportsService } from "@/services";
import type { ReportExportParams } from "@/types/reports";
import { triggerBrowserDownload } from "@/utils/donwload.file";

type ExportReportPayload = ReportExportParams & {
  filename: string;
  mimeType: string;
};

export class EmptyReportExportError extends Error {
  constructor() {
    super("Não existem dados para exportar no período selecionado.");
    this.name = "EmptyReportExportError";
  }
}

async function assertReportHasContent(response: AxiosResponse<Blob>) {
  const contentType = String(response.headers["content-type"] || response.data.type || "");

  if (response.status === 204 || response.data.size === 0) {
    throw new EmptyReportExportError();
  }

  if (contentType?.includes("application/json")) {
    const payload = await response.data.text();
    const normalizedPayload = payload.toLowerCase();

    if (
      normalizedPayload.includes("sem dados") ||
      normalizedPayload.includes("no data") ||
      normalizedPayload.includes("empty")
    ) {
      throw new EmptyReportExportError();
    }

    throw new Error("Não foi possível exportar o relatório.");
  }
}

async function normalizeReportExportError(error: unknown): Promise<never> {
  if (axios.isAxiosError(error) && error.response?.data instanceof Blob) {
    const payload = await error.response.data.text();
    const normalizedPayload = payload.toLowerCase();

    if (
      normalizedPayload.includes("sem dados") ||
      normalizedPayload.includes("no data") ||
      normalizedPayload.includes("empty") ||
      normalizedPayload.includes("not found")
    ) {
      throw new EmptyReportExportError();
    }
  }

  throw error;
}

export function useReportExport() {
  return useMutation({
    mutationFn: async ({ filename, mimeType, ...params }: ExportReportPayload) => {
      try {
        const response = await reportsService.exportReport(params);
        await assertReportHasContent(response);
        triggerBrowserDownload(response, filename, mimeType);
      } catch (error) {
        await normalizeReportExportError(error);
      }
    },
  });
}
