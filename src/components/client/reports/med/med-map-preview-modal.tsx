'use client';

import React, { useState, useEffect } from 'react';
import { GlobalModal, Button, Icon } from '@/components';
import { MedStatisticalReport, MedSnapshotCut, ClassStatisticalRow } from '@/types/reports-med';

interface MedMapPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedReport: MedStatisticalReport | null;
  onConfirmSubmission: (reportId: string, protocolNumber: string) => void;
}

export function MedMapPreviewModal({
  isOpen,
  onClose,
  selectedReport,
  onConfirmSubmission,
}: MedMapPreviewModalProps) {
  const [protocolInput, setProtocolInput] = useState('');

  useEffect(() => {
    if (selectedReport) {
      setProtocolInput(selectedReport.submissionProtocolNumber || '');
    }
  }, [selectedReport]);

  if (!selectedReport) return null;

  const getCutLabel = (cut: MedSnapshotCut) => {
    switch (cut) {
      case 'ENROLLMENT_START':
        return 'Início do Ano Lectivo (Abertura)';
      case 'TERM_1_CLOSE':
        return 'Fecho do 1.º Trimestre';
      case 'TERM_2_CLOSE':
        return 'Fecho do 2.º Trimestre';
      case 'FINAL_YEAR':
        return 'Fecho Anual / Pauta Final';
    }
  };

  const handleProtocol = () => {
    const protocol = protocolInput.trim() || `PROT-MED/DPE-LUANDA/${Date.now()}`;
    onConfirmSubmission(selectedReport.id, protocol);
  };

  return (
    <GlobalModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Mapa Oficial: ${selectedReport.reportCode}`}
      className="!w-[95vw] sm:!max-w-4xl lg:!max-w-6xl"
    >
      <div className="space-y-6">
        {/* Folha A4 em Formato Paisagem Panorâmico Oficial do MED */}
        <div className="bg-white text-slate-900 p-6 sm:p-10 rounded-xl border border-border shadow-lg font-sans text-xs relative overflow-x-auto">
          {/* Cabeçalho Oficial do MED */}
          <div className="text-center space-y-0.5 border-b-2 border-slate-900 pb-4 mb-6">
            <p className="text-[11px] uppercase font-semibold tracking-widest text-slate-700">REPÚBLICA DE ANGOLA</p>
            <p className="text-[11px] uppercase font-semibold tracking-wider text-slate-800">MINISTÉRIO DA EDUCAÇÃO</p>
            <p className="text-[10px] uppercase text-slate-600 font-medium">{selectedReport.provincialDirectorate}</p>
            <p className="text-[10px] text-slate-500">{selectedReport.municipalDirectorate}</p>
            <h2 className="text-base font-bold uppercase tracking-tight text-slate-950 mt-2">
              MAPA ESTATÍSTICO DE RENDIMENTO ESCOLAR E DEMOGRAFIA ({getCutLabel(selectedReport.snapshotCut).toUpperCase()})
            </h2>
            <div className="flex items-center justify-center gap-6 text-[10px] text-slate-600 pt-1 font-mono">
              <span>Ano Lectivo: <strong>{selectedReport.academicYear}</strong></span>
              <span>Escola: <strong>{selectedReport.schoolName}</strong></span>
              <span>Código de Registo: <strong>{selectedReport.reportCode}</strong></span>
            </div>
          </div>

          {/* Tabela Estatística Padronizada Oficial do MED */}
          <div className="overflow-x-auto border border-slate-300 rounded-lg">
            <table className="w-full text-center border-collapse text-[11px]">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 font-medium text-slate-800">
                  <th rowSpan={2} className="p-2 border-r border-slate-300 text-left">Classe & Turma</th>
                  <th rowSpan={2} className="p-2 border-r border-slate-300">Turno</th>
                  <th colSpan={3} className="p-1 border-r border-slate-300 bg-slate-200/60">Matriculados</th>
                  <th colSpan={3} className="p-1 border-r border-slate-300 bg-slate-200/60">Avaliados</th>
                  <th colSpan={3} className="p-1 border-r border-slate-300 bg-emerald-50">Aprovados</th>
                  <th colSpan={3} className="p-1 border-r border-slate-300 bg-rose-50">Reprovados</th>
                  <th colSpan={5} className="p-1 border-r border-slate-300 bg-amber-50">Menções Qualitativas MED</th>
                  <th rowSpan={2} className="p-2 bg-slate-100 font-medium">% Aprov.</th>
                </tr>
                <tr className="bg-slate-50 border-b border-slate-300 text-[10px] text-slate-600 font-medium">
                  {/* Matriculados */}
                  <th className="p-1 border-r border-slate-200">M</th>
                  <th className="p-1 border-r border-slate-200">F</th>
                  <th className="p-1 border-r border-slate-300 font-medium">T</th>
                  {/* Avaliados */}
                  <th className="p-1 border-r border-slate-200">M</th>
                  <th className="p-1 border-r border-slate-200">F</th>
                  <th className="p-1 border-r border-slate-300 font-medium">T</th>
                  {/* Aprovados */}
                  <th className="p-1 border-r border-slate-200">M</th>
                  <th className="p-1 border-r border-slate-200">F</th>
                  <th className="p-1 border-r border-slate-300 font-medium">T</th>
                  {/* Reprovados */}
                  <th className="p-1 border-r border-slate-200">M</th>
                  <th className="p-1 border-r border-slate-200">F</th>
                  <th className="p-1 border-r border-slate-300 font-medium">T</th>
                  {/* Menções */}
                  <th className="p-1 border-r border-slate-200">Muito Bom</th>
                  <th className="p-1 border-r border-slate-200">Bom</th>
                  <th className="p-1 border-r border-slate-200">Sufic.</th>
                  <th className="p-1 border-r border-slate-200">Medíoc.</th>
                  <th className="p-1 border-r border-slate-300 text-rose-700">Mau</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono">
                {selectedReport.rows.map((row: ClassStatisticalRow) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-2 border-r border-slate-200 text-left font-sans font-medium text-slate-900">
                      {row.classLevel} - {row.sectionName}
                    </td>
                    <td className="p-2 border-r border-slate-200 font-sans text-slate-600">{row.shift}</td>
                    {/* Matriculados */}
                    <td className="p-1 border-r border-slate-200">{row.enrolledStudents.male}</td>
                    <td className="p-1 border-r border-slate-200">{row.enrolledStudents.female}</td>
                    <td className="p-1 border-r border-slate-300 font-medium text-slate-900">{row.enrolledStudents.total}</td>
                    {/* Avaliados */}
                    <td className="p-1 border-r border-slate-200">{row.evaluatedStudents.male}</td>
                    <td className="p-1 border-r border-slate-200">{row.evaluatedStudents.female}</td>
                    <td className="p-1 border-r border-slate-300 font-medium text-slate-900">{row.evaluatedStudents.total}</td>
                    {/* Aprovados */}
                    <td className="p-1 border-r border-slate-200 text-emerald-700">{row.passedStudents.male}</td>
                    <td className="p-1 border-r border-slate-200 text-emerald-700">{row.passedStudents.female}</td>
                    <td className="p-1 border-r border-slate-300 font-medium text-emerald-800">{row.passedStudents.total}</td>
                    {/* Reprovados */}
                    <td className="p-1 border-r border-slate-200 text-rose-700">{row.failedStudents.male}</td>
                    <td className="p-1 border-r border-slate-200 text-rose-700">{row.failedStudents.female}</td>
                    <td className="p-1 border-r border-slate-300 font-medium text-rose-800">{row.failedStudents.total}</td>
                    {/* Menções */}
                    <td className="p-1 border-r border-slate-200 text-emerald-700 font-medium">{row.gradeDistribution.veryGood.total}</td>
                    <td className="p-1 border-r border-slate-200 text-emerald-600">{row.gradeDistribution.good.total}</td>
                    <td className="p-1 border-r border-slate-200 text-slate-700">{row.gradeDistribution.sufficient.total}</td>
                    <td className="p-1 border-r border-slate-200 text-amber-700">{row.gradeDistribution.mediocre.total}</td>
                    <td className="p-1 border-r border-slate-300 text-rose-700 font-medium">{row.gradeDistribution.poor.total}</td>
                    {/* Taxa */}
                    <td className="p-1 font-medium text-slate-900">{row.passRatePercentage.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
              {/* Linha de Totais da Escola */}
              <tfoot>
                <tr className="bg-slate-200/80 font-medium border-t-2 border-slate-400 text-slate-900 font-mono">
                  <td className="p-2 text-left font-sans" colSpan={2}>TOTAIS DO COMPLEXO ESCOLAR:</td>
                  <td className="p-1">{selectedReport.rows.reduce((acc: number, r: ClassStatisticalRow) => acc + r.enrolledStudents.male, 0)}</td>
                  <td className="p-1">{selectedReport.rows.reduce((acc: number, r: ClassStatisticalRow) => acc + r.enrolledStudents.female, 0)}</td>
                  <td className="p-1 font-medium border-r border-slate-400">{selectedReport.totalStudents.total}</td>

                  <td className="p-1">{selectedReport.rows.reduce((acc: number, r: ClassStatisticalRow) => acc + r.evaluatedStudents.male, 0)}</td>
                  <td className="p-1">{selectedReport.rows.reduce((acc: number, r: ClassStatisticalRow) => acc + r.evaluatedStudents.female, 0)}</td>
                  <td className="p-1 font-medium border-r border-slate-400">{selectedReport.totalStudents.total}</td>

                  <td className="p-1 text-emerald-800">{selectedReport.totalPassed.male}</td>
                  <td className="p-1 text-emerald-800">{selectedReport.totalPassed.female}</td>
                  <td className="p-1 font-medium text-emerald-900 border-r border-slate-400">{selectedReport.totalPassed.total}</td>

                  <td className="p-1 text-rose-800">{selectedReport.totalFailed.male}</td>
                  <td className="p-1 text-rose-800">{selectedReport.totalFailed.female}</td>
                  <td className="p-1 font-medium text-rose-900 border-r border-slate-400">{selectedReport.totalFailed.total}</td>

                  <td colSpan={5} className="border-r border-slate-400 text-slate-600 font-sans text-[10px]">
                    Estratificação Qualitativa Auditada
                  </td>
                  <td className="p-1 text-primary text-sm font-medium">{selectedReport.overallPassRate.toFixed(1)}%</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Termo de Encerramento e Assinaturas */}
          <div className="grid grid-cols-2 gap-8 text-center pt-8 mt-6 border-t border-slate-300 font-sans text-xs">
            <div>
              <div className="border-b border-slate-400 w-48 mx-auto mb-2" />
              <p className="font-semibold text-slate-900">O(A) Director(a) Pedagógico(a)</p>
              <p className="text-[10px] text-slate-500">{selectedReport.generatedBy}</p>
            </div>
            <div>
              <div className="border-b border-slate-400 w-48 mx-auto mb-2" />
              <p className="font-semibold text-slate-900">O(A) Director(a) Geral do Colégio</p>
              <p className="text-[10px] text-slate-500">Direcção Geral / Conselho de Direcção</p>
            </div>
          </div>

          {/* Rodapé Oficial de Auditoria */}
          <div className="mt-6 pt-3 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500 font-mono">
            <div>
              Protocolo: <strong className="text-slate-800">{selectedReport.submissionProtocolNumber || 'Aguardando submissão'}</strong>
            </div>
            <div>
              Gerado em: {selectedReport.generatedAt} • Conforme Decreto Presidencial n.º 424/25
            </div>
          </div>
        </div>

        {/* Ações e Submissão ao MED */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <div className="flex items-center gap-2">
            {selectedReport.status !== 'OFFICIALLY_SUBMITTED' ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Número de Protocolo da DPE..."
                  value={protocolInput}
                  onChange={(e) => setProtocolInput(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded border border-border bg-background font-mono w-56"
                />
                <Button
                  size="sm"
                  variant="default"
                  onClick={handleProtocol}
                  className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <Icon name="CircleCheck" className="w-4 h-4" />
                  Protocolar no MED
                </Button>
              </div>
            ) : (
              <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1.5">
                <Icon name="CheckCheck" className="w-4 h-4" />
                Protocolado sob o n.º {selectedReport.submissionProtocolNumber}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={() => window.print()}
              className="gap-1.5 text-xs font-semibold"
            >
              <Icon name="Printer" className="w-4 h-4" />
              Imprimir Mapa A4
            </Button>
            <Button variant="outline" size="sm" onClick={onClose}>
              Fechar
            </Button>
          </div>
        </div>
      </div>
    </GlobalModal>
  );
}
