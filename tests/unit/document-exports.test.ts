import React from "react";
import { PautaExportModal } from "@/components/client/grades/pautas/pauta-export-modal";
import { TransitionsExportModal } from "@/components/client/grades/transitions/transitions-export-modal";
import { AttendanceExportModal } from "@/components/client/academic/attendance/attendance-export-modal";
import { FinanceReportExportModal } from "@/components/client/reports/finance/finance-report-export-modal";

describe("Exportação de Documentos Oficiais Escolares", () => {
  it("deve exportar PautaExportModal como componente React válido", () => {
    expect(PautaExportModal).toBeDefined();
    expect(typeof PautaExportModal).toBe("function");
  });

  it("deve exportar TransitionsExportModal como componente React válido", () => {
    expect(TransitionsExportModal).toBeDefined();
    expect(typeof TransitionsExportModal).toBe("function");
  });

  it("deve exportar AttendanceExportModal como componente React válido", () => {
    expect(AttendanceExportModal).toBeDefined();
    expect(typeof AttendanceExportModal).toBe("function");
  });

  it("deve exportar FinanceReportExportModal como componente React válido", () => {
    expect(FinanceReportExportModal).toBeDefined();
    expect(typeof FinanceReportExportModal).toBe("function");
  });
});
