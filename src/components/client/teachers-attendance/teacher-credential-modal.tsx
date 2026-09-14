'use client';

import React from 'react';
import { GlobalModal, Button, Icon } from '@/components';
import { TeacherQrCredential } from '@/types/teacher-attendance';

interface TeacherCredentialModalProps {
  isOpen: boolean;
  onClose: () => void;
  credential?: TeacherQrCredential;
}

export function TeacherCredentialModal({
  isOpen,
  onClose,
  credential,
}: TeacherCredentialModalProps) {
  if (!credential) return null;

  return (
    <GlobalModal
      isOpen={isOpen}
      onClose={onClose}
      title="Cartão Institucional Docente (Para Impressão)"
      className="!w-[95vw] sm:!max-w-md"
    >
      <div className="space-y-6 text-center">
        {/* Design do Cartão PVC Simulado */}
        <div className="w-80 mx-auto rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white p-6 shadow-xl border border-slate-700 relative overflow-hidden text-left">
          {/* Marca d'água */}
          <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none">
            <Icon name="GraduationCap" className="w-48 h-48 text-white" />
          </div>

          {/* Cabeçalho do Cartão */}
          <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
            <div>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-primary">República de Angola</span>
              <h4 className="font-bold text-sm tracking-tight text-white">MINDSCHOOL ANGOLA</h4>
            </div>
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-semibold text-xs border border-primary/40">
              MS
            </div>
          </div>

          {/* Informações do Docente */}
          <div className="my-4 flex gap-4 items-center">
            <div className="w-16 h-16 rounded-xl bg-slate-800 border border-slate-600 flex items-center justify-center text-slate-400">
              <Icon name="User" className="w-8 h-8" />
            </div>
            <div>
              <h5 className="font-semibold text-sm text-white leading-tight">{credential.teacherName}</h5>
              <p className="text-xs text-primary font-medium mt-0.5">Corpo Docente</p>
              <p className="text-[11px] font-mono text-slate-400 mt-0.5">{credential.teacherCode}</p>
            </div>
          </div>

          {/* QR Code de Ponto Físico */}
          <div className="bg-white p-3 rounded-xl flex items-center justify-center max-w-[140px] mx-auto shadow-md">
            <div className="text-center">
              <div className="w-24 h-24 bg-slate-950 p-1 flex items-center justify-center rounded">
                <Icon name="QrCode" className="w-20 h-20 text-white" />
              </div>
              <span className="text-[9px] font-mono text-slate-900 block mt-1 font-semibold">
                {credential.teacherCode}
              </span>
            </div>
          </div>

          <p className="text-[9px] text-center text-slate-400 mt-4">
            Cartão oficial para registo de assiduidade diária nas instalações escolares.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3">
          <Button
            variant="default"
            size="sm"
            onClick={() => window.print()}
            className="gap-1.5 text-xs font-semibold"
          >
            <Icon name="Printer" className="w-4 h-4" />
            Imprimir Cartão
          </Button>
          <Button variant="outline" size="sm" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </div>
    </GlobalModal>
  );
}
