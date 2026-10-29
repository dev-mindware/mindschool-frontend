"use client";
import { formatDate } from "@/utils";

import { FormModal } from "@/components";
import { useTransport } from "@/hooks/school/use-transport";
import { useModal } from "@/stores/modal/use-modal-store";
import { useSchoolSettingsStore } from "@/stores/school/school-settings-store";

/** Lista de passageiros da rota, por paragem (folha imprimível para o motorista). */
export function RouteManifestPrintModal() {
  const { routes, assignments, nameOf } = useTransport();
  const { modalData } = useModal();
  const { profile } = useSchoolSettingsStore();
  const route = routes.find((r) => r.id === (modalData["transport-manifest"] as { routeId?: string } | undefined)?.routeId);
  const riders = assignments.filter((a) => a.route_id === route?.id);

  return (
    <FormModal
      id="transport-manifest"
      title="Lista de passageiros"
      description="Folha de passageiros em formato PDF para o motorista."
      size="lg"
      submitLabel="Baixar PDF"
      keepOpen
      printContentId="transport-manifest-print-content"
      pdfFilename={`Manifesto_Rota_${route?.name || "transporte"}.pdf`}
      onSubmit={() => {}}
    >
      {route && (
        <div id="transport-manifest-print-content" className="sm:col-span-2 space-y-4 rounded-xs border bg-white p-6 text-sm text-slate-900 print:border-0">
          <div className="border-b pb-3 text-center">
            <div className="text-sm font-black uppercase">{profile.schoolName}</div>
            <div className="text-[11px] text-slate-500">Transporte escolar — {route.name}</div>
            <div className="text-[11px] text-slate-500">{route.vehicle_plate ?? "Sem viatura"} • {route.driver_name ?? "Sem motorista"}{route.driver_phone ? ` • ${route.driver_phone}` : ""}</div>
          </div>
          {route.stops.map((s) => {
            const list = riders.filter((a) => a.stop_id === s.id);
            return (
              <div key={s.id}>
                <div className="text-xs font-semibold">{s.order_index}. {s.name}{s.pickup_time ? ` — ${s.pickup_time}` : ""} <span className="font-normal text-slate-500">({list.length})</span></div>
                <ul className="list-disc pl-5 text-xs text-slate-700">
                  {list.map((a) => <li key={a.id}>{nameOf.get(a.student_id) ?? "Aluno"}</li>)}
                  {list.length === 0 && <li className="list-none text-slate-400">—</li>}
                </ul>
              </div>
            );
          })}
          <div className="pt-2 text-xs text-slate-500">{riders.length} passageiro(s) • emitido em {formatDate(new Date())}</div>
        </div>
      )}
    </FormModal>
  );
}
