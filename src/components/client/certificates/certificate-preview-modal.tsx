'use client';

import React from 'react';
import { GlobalModal, Button, Icon } from '@/components';
import { OfficialDocumentItem } from '@/types/certificate';

interface CertificatePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDocument: OfficialDocumentItem | null;
}

export function CertificatePreviewModal({
  isOpen,
  onClose,
  selectedDocument,
}: CertificatePreviewModalProps) {
  if (!selectedDocument) return null;

  return (
    <GlobalModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Documento: ${selectedDocument.documentNumber}`}
      className="!w-[95vw] sm:!max-w-2xl lg:!max-w-4xl"
    >
      <div className="space-y-6">
        {/* Folha A4 Timbrada Oficial Simulada */}
        <div className="bg-white text-slate-900 p-8 sm:p-12 rounded-xl border border-border shadow-lg font-serif relative overflow-hidden">
          {/* Marca d'água */}
          <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
            <Icon name="GraduationCap" className="w-96 h-96 text-slate-900" />
          </div>

          {/* Cabeçalho Oficial de Angola */}
          <div className="text-center space-y-1 mb-8 border-b-2 border-slate-900 pb-4">
            <p className="text-xs uppercase font-semibold tracking-widest text-slate-700">REPÚBLICA DE ANGOLA</p>
            <p className="text-xs uppercase font-medium text-slate-700">MINISTÉRIO DA EDUCAÇÃO</p>
            <p className="text-xs uppercase text-slate-600">DIRECÇÃO PROVINCIAL DA EDUCAÇÃO DE LUANDA</p>
            <h2 className="text-lg font-bold uppercase tracking-tight text-slate-950 mt-2">
              COMPLEXO ESCOLAR MINDSCHOOL
            </h2>
            <p className="text-[10px] text-slate-500 font-sans">
              Ensino Primário, I e II Ciclos do Ensino Secundário Geral • Luanda - Angola
            </p>
          </div>

          {/* Título do Documento */}
          <div className="text-center my-6">
            <span className="text-xs font-mono font-medium text-slate-600 uppercase block mb-1">
              N.º {selectedDocument.documentNumber}
            </span>
            <h3 className="text-xl font-bold uppercase tracking-wide underline underline-offset-4 decoration-1">
              {selectedDocument.documentType === 'HABILITATION_CERTIFICATE'
                ? 'CERTIFICADO DE HABILITAÇÕES LITERÁRIAS'
                : selectedDocument.documentType === 'DECLARATION_WITH_GRADES'
                ? 'DECLARAÇÃO COM NOTAS'
                : selectedDocument.documentType === 'TRANSFER_GUIDE'
                ? 'GUIA OFICIAL DE TRANSFERÊNCIA'
                : 'DECLARAÇÃO DE FREQUÊNCIA ESCOLAR'}
            </h3>
          </div>

          {/* Corpo Textual Formal do Documento */}
          <div className="text-justify text-sm leading-relaxed space-y-4 my-8 font-sans">
            <p>
              Para os devidos efeitos e a pedido do encarregado de educação, declara-se que{' '}
              <strong className="font-semibold text-slate-950 underline decoration-slate-400">
                {selectedDocument.studentName}
              </strong>
              , portador do processo individual n.º{' '}
              <span className="font-mono font-semibold">{selectedDocument.studentNumber}</span>, está regularmente
              matriculado e frequenta nesta instituição de ensino a{' '}
              <strong className="font-semibold">{selectedDocument.className}</strong>, no ano lectivo de{' '}
              <strong className="font-semibold">{selectedDocument.academicYear}</strong>.
            </p>

            <p>
              A presente declaração é emitida especificamente{' '}
              <span className="italic font-medium">{selectedDocument.purpose}</span>, constando nos livros de matrícula e
              termos de aproveitamento sob custódia legal desta Secretaria.
            </p>

            <p>
              E, por ser verdade e me haver sido solicitada, mandei passar a presente declaração que vai por mim assinada
              e autenticada com o carimbo a óleo e selo em uso nesta instituição.
            </p>
          </div>

          {/* Data e Localidade */}
          <div className="text-right text-xs my-6 font-sans">
            <p>Luanda, aos {selectedDocument.issueDate}.</p>
          </div>

          {/* Assinaturas Oficiais */}
          <div className="grid grid-cols-2 gap-8 text-center pt-8 mt-12 border-t border-slate-300 font-sans text-xs">
            <div>
              <div className="border-b border-slate-400 w-44 mx-auto mb-2" />
              <p className="font-semibold text-slate-900">O(A) Secretário(a) Geral</p>
              <p className="text-[10px] text-slate-500">{selectedDocument.issuedBy}</p>
            </div>
            <div>
              <div className="border-b border-slate-400 w-44 mx-auto mb-2" />
              <p className="font-semibold text-slate-900">O(A) Director(a) Pedagógico(a)</p>
              <p className="text-[10px] text-slate-500">Direcção Pedagógica Geral</p>
            </div>
          </div>

          {/* Rodapé de Validação e Código QR */}
          <div className="mt-8 pt-4 border-t border-slate-200 flex items-center justify-between font-sans text-[10px] text-slate-500">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-slate-100 p-1 border border-slate-300 rounded flex items-center justify-center">
                <Icon name="QrCode" className="w-8 h-8 text-slate-800" />
              </div>
              <div>
                <p className="font-semibold text-slate-700">Autenticidade Verificável por QR Code</p>
                <p className="font-mono">Código: {selectedDocument.verificationCode}</p>
              </div>
            </div>
            <div className="text-right">
              <p>Documento processado por computador • MindSchool Angola</p>
              <p className="font-mono">Emissão válida por 90 dias</p>
            </div>
          </div>
        </div>

        {/* Ações */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-muted-foreground font-mono">
            Autenticação: {selectedDocument.verificationCode}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={() => window.print()}
              className="gap-1.5 text-xs font-semibold"
            >
              <Icon name="Printer" className="w-4 h-4" />
              Imprimir Documento
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
