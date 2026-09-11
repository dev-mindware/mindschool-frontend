"use client";

import { useState } from "react";
import { startOfMonth } from "date-fns";
import { ReportFilters } from "./report-filters";
import { ReportExportButton } from "./report-export-button";
import type { ReportExportType } from "@/types/reports";

interface ReportExportPanelProps {
  reportType?: ReportExportType;
  filenamePrefix: string;
  className?: string;
  showReportTypeSelect?: boolean;
}

export function ReportExportPanel({
  reportType: defaultReportType = "SALES",
  filenamePrefix,
  className,
  showReportTypeSelect = false,
}: ReportExportPanelProps) {
  const [startDate, setStartDate] = useState<Date | undefined>(
    startOfMonth(new Date()),
  );
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [selectedReportType, setSelectedReportType] =
    useState<ReportExportType>(defaultReportType);

  const activeReportType = showReportTypeSelect
    ? selectedReportType
    : defaultReportType;

  return (
    <div className={className}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto] md:items-end">
        <ReportFilters
          filters={[
            ...(showReportTypeSelect
              ? [
                  {
                    type: "select" as const,
                    label: "Tipo de Relatório",
                    value: selectedReportType,
                    onChange: (value: string) =>
                      setSelectedReportType(value as ReportExportType),
                    options: [
                      { value: "SALES", label: "Vendas" },
                      { value: "BILLING", label: "Facturação" },
                    ],
                    placeholder: "Seleccione o tipo",
                  },
                ]
              : []),
            {
              type: "date",
              label: "Data Início",
              value: startDate,
              onChange: setStartDate,
            },
            {
              type: "date",
              label: "Data Fim",
              value: endDate,
              onChange: setEndDate,
              disabledDates: (date) => (startDate ? date < startDate : false),
            },
          ]}
        />
        <ReportExportButton
          reportType={activeReportType}
          startDate={startDate}
          endDate={endDate}
          filenamePrefix={filenamePrefix}
          className="w-full md:w-auto"
        />
      </div>
    </div>
  );
}
