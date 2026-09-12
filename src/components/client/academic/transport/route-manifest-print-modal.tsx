"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Button,
  Icon,
} from "@/components";
import { TransportRoute, StudentTransportAssignment } from "@/types";

interface RouteManifestPrintModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  route: TransportRoute | null;
  assignments: StudentTransportAssignment[];
}

export function RouteManifestPrintModal({
  open,
  onOpenChange,
  route,
  assignments,
}: RouteManifestPrintModalProps) {
  if (!route) return null;

  const routeAssignments = assignments.filter((a) => a.routeId === route.id && a.isActive);

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[95vh] overflow-y-auto print:p-0">
        <DialogHeader className="print:hidden">
          <DialogTitle className="flex items-center justify-between text-base">
            <span className="flex items-center gap-2">
              <Icon name="Printer" className="size-5 text-primary" />
              Guia Oficial de Rota & Manifesto de Embarque (A4)
            </span>
            <Button size="sm" onClick={handlePrint} className="gap-1.5">
              <Icon name="Printer" className="size-4" />
              Imprimir Guia
            </Button>
          </DialogTitle>
        </DialogHeader>

        {/* Printable Official A4 Document */}
        <div className="bg-white text-black p-8 rounded-lg shadow-sm border border-neutral-200 print:border-none print:shadow-none font-serif text-[12px] leading-relaxed space-y-5">
          {/* Header */}
          <div className="text-center space-y-1 border-b border-neutral-300 pb-3">
            <p className="font-bold text-xs uppercase tracking-widest text-neutral-800">
              República de Angola • Governo Provincial de Luanda
            </p>
            <p className="font-bold text-sm text-neutral-900 tracking-wide">
              COMPLEXO ESCOLAR PRIVADO MINDSCHOOL
            </p>
            <p className="text-[11px] text-neutral-600 italic">
              Serviço de Apoio ao Estudante • Departamento de Transporte & Frotas Escolares
            </p>
          </div>

          {/* Title */}
          <div className="text-center py-1.5 bg-neutral-100 border-y border-neutral-300">
            <h2 className="font-bold text-sm uppercase tracking-wider text-neutral-900">
              Guia de Transporte Escolar & Manifesto Nominal de Passageiros
            </h2>
            <p className="text-[10px] text-neutral-600 font-mono">
              Código: {route.code} • Data de Emissão: {new Date().toLocaleDateString("pt-AO")}
            </p>
          </div>

          {/* Route & Crew Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-neutral-50 p-3 rounded border border-neutral-200 text-xs">
            <div>
              <span className="text-neutral-500 block text-[10px]">Nome da Rota:</span>
              <strong className="text-neutral-900">{route.name}</strong>
            </div>
            <div>
              <span className="text-neutral-500 block text-[10px]">Viatura & Matrícula:</span>
              <strong className="text-neutral-900 font-mono">{route.vehiclePlate}</strong>
            </div>
            <div>
              <span className="text-neutral-500 block text-[10px]">Motorista Responsável:</span>
              <strong className="text-neutral-900">{route.driverName}</strong>
              <span className="block text-[10px] text-neutral-600">{route.driverPhone}</span>
            </div>
            <div>
              <span className="text-neutral-500 block text-[10px]">Monitor(a) de Bordo:</span>
              <strong className="text-neutral-900">{route.monitorName}</strong>
              <span className="block text-[10px] text-neutral-600">{route.monitorPhone}</span>
            </div>
          </div>

          {/* Itinerary & Stops */}
          <div className="space-y-1.5">
            <h3 className="font-bold text-xs uppercase tracking-wider text-neutral-800 border-b pb-0.5">
              1. Itinerário & Horários Previstos das Paragens
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {route.stops.map((stp) => (
                <div key={stp.id} className="p-2 border rounded bg-neutral-50/50 flex items-center justify-between">
                  <div>
                    <span className="font-bold mr-1 text-primary">{stp.order}.</span>
                    <span className="font-medium text-neutral-900">{stp.name}</span>
                    {stp.landmark && (
                      <span className="block text-[10px] text-neutral-500">{stp.landmark}</span>
                    )}
                  </div>
                  <div className="text-right text-[11px] font-mono text-neutral-700">
                    <div>Recolha: <strong>{stp.estimatedPickupTime}</strong></div>
                    <div>Larga: {stp.estimatedDropoffTime}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Passenger manifest */}
          <div className="space-y-1.5">
            <h3 className="font-bold text-xs uppercase tracking-wider text-neutral-800 border-b pb-0.5">
              2. Lista Nominal de Estudantes ({routeAssignments.length} Alunos Alocados / Lotação: {route.maxCapacity})
            </h3>
            <table className="w-full text-left border border-neutral-300 text-xs">
              <thead className="bg-neutral-100 border-b border-neutral-300 text-[11px]">
                <tr>
                  <th className="p-2 border-r">Nº Processo</th>
                  <th className="p-2 border-r">Nome do Aluno</th>
                  <th className="p-2 border-r">Classe / Turma</th>
                  <th className="p-2 border-r">Paragem de Embarque</th>
                  <th className="p-2 border-r">Encarregado / Contacto</th>
                  <th className="p-2 text-center w-16">Visto Ida</th>
                  <th className="p-2 text-center w-16">Visto Volta</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {routeAssignments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-3 text-center text-neutral-500 italic">
                      Nenhum aluno registado nesta rota até ao momento.
                    </td>
                  </tr>
                ) : (
                  routeAssignments.map((asg) => (
                    <tr key={asg.id}>
                      <td className="p-2 border-r font-mono text-[10px]">{asg.studentNumber}</td>
                      <td className="p-2 border-r font-medium">{asg.studentName}</td>
                      <td className="p-2 border-r">{asg.classLevel} ({asg.sectionName})</td>
                      <td className="p-2 border-r">{asg.stopName}</td>
                      <td className="p-2 border-r text-[11px]">
                        {asg.guardianName}
                        <span className="block font-mono text-[10px] text-neutral-600">{asg.guardianPhone}</span>
                      </td>
                      <td className="p-2 border-r text-center">☐</td>
                      <td className="p-2 text-center">☐</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Safety rules note */}
          <div className="text-[10px] text-neutral-500 border-t pt-2 space-y-0.5">
            <p><strong>Normas de Segurança Rodoviária:</strong> 1. Uso obrigatório do cinto de segurança durante todo o trajecto; 2. Proibido colocar membros fora das janelas; 3. O aluno apenas poderá ser entregue na paragem autorizada ao encarregado ou pessoa devidamente credenciada.</p>
          </div>

          {/* Signatures */}
          <div className="pt-6 grid grid-cols-3 gap-6 text-center text-xs">
            <div>
              <div className="border-b border-neutral-400 w-4/5 mx-auto mb-1" />
              <p className="font-bold text-neutral-800">Motorista da Viatura</p>
              <p className="text-[9px] text-neutral-500">Assinatura</p>
            </div>
            <div>
              <div className="border-b border-neutral-400 w-4/5 mx-auto mb-1" />
              <p className="font-bold text-neutral-800">Monitor(a) de Bordo</p>
              <p className="text-[9px] text-neutral-500">Conferência dos Alunos</p>
            </div>
            <div>
              <div className="border-b border-neutral-400 w-4/5 mx-auto mb-1" />
              <p className="font-bold text-neutral-800">Coord. de Transporte</p>
              <p className="text-[9px] text-neutral-500">Despacho Institucional</p>
            </div>
          </div>
        </div>

        <DialogFooter className="print:hidden gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          <Button onClick={handlePrint} className="gap-1.5">
            <Icon name="Printer" className="size-4" />
            Imprimir Folha de Rota
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
