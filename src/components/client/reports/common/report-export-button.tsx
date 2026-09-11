"use client";

import { format } from "date-fns";
import { toast } from "sonner";
import { Button, Icon } from "@/components";
import { EmptyReportExportError, useReportExport } from "@/hooks/reports";
import type { ReportExportType } from "@/types/reports";

const EXCEL_EXPORT_CONFIG = {
  extension: "xlsx",
  mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
};

interface ReportExportButtonProps {
  reportType: ReportExportType;
  startDate?: Date;
  endDate?: Date;
  filenamePrefix?: string;
  className?: string;
  hasData?: boolean;
}

export function ReportExportButton({
  reportType,
  startDate,
  endDate,
  filenamePrefix,
  className,
  hasData,
}: ReportExportButtonProps) {
  const { mutate, isPending } = useReportExport();
  const hasRequiredDates = Boolean(startDate && endDate);

  function handleExport() {
    if (!startDate || !endDate) {
      toast.error("Seleccione a data inicial e final para exportar.");
      return;
    }

    if (hasData === false) {
      toast.error("Não existem dados para exportar no período selecionado.");
      return;
    }

    const formattedStartDate = format(startDate, "yyyy-MM-dd");
    const formattedEndDate = format(endDate, "yyyy-MM-dd");
    mutate(
      {
        reportType,
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        filename: `${filenamePrefix ?? reportType.toLowerCase()}-${formattedStartDate}-${formattedEndDate}.${EXCEL_EXPORT_CONFIG.extension}`,
        mimeType: EXCEL_EXPORT_CONFIG.mimeType,
      },
      {
        onError: (error) => {
          toast.error(
            error instanceof EmptyReportExportError
              ? error.message
              : "Não foi possível exportar o relatório.",
          );
        },
      },
    );
  }

  return (
    <Button
      type="button"
      variant="outline"
      className={className}
      onClick={handleExport}
      loading={isPending}
      disabled={!hasRequiredDates || isPending}
    >
      <Icon name="Download" className="w-4 h-4" />
      Exportar
    </Button>
  );
}
