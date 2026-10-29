'use client';

import { GlobalModal, Button, Icon, PrintDownloadDropdown } from '@/components';
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
      size="md"
    >
      <div className="space-y-6 text-center">
        {/* Design do Cartão PVC Simulado */}
        <div id="teacher-qr-card-sheet" className="relative mx-auto w-80 overflow-hidden rounded-xs border border-primary/40 bg-primary p-6 text-left text-primary-foreground shadow-sm">
          {/* Marca d'água */}
          <div className="pointer-events-none absolute -bottom-8 -right-8 opacity-10">
            <Icon name="GraduationCap" className="size-48 text-primary-foreground" />
          </div>

          {/* Cabeçalho do Cartão */}
          <div className="flex items-center justify-between border-b border-primary-foreground/20 pb-3">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-primary-foreground/80">República de Angola</span>
              <h4 className="text-sm font-bold tracking-tight text-primary-foreground">MINDSCHOOL ANGOLA</h4>
            </div>
            <div className="flex size-8 items-center justify-center rounded-xs border border-primary-foreground/30 bg-primary-foreground/15 text-xs font-semibold text-primary-foreground">
              MS
            </div>
          </div>

          {/* Informações do Docente */}
          <div className="my-4 flex items-center gap-4">
            <div className="flex size-16 items-center justify-center rounded-xs border border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground">
              <Icon name="User" className="size-8" />
            </div>
            <div>
              <h5 className="text-sm font-semibold leading-tight text-primary-foreground">{credential.teacherName}</h5>
              <p className="mt-0.5 text-xs font-medium text-primary-foreground/80">Corpo Docente</p>
              <p className="mt-0.5 font-mono text-[11px] text-primary-foreground/70">{credential.teacherCode}</p>
            </div>
          </div>

          {/* QR Code de Ponto Físico */}
          <div className="mx-auto flex max-w-[140px] items-center justify-center rounded-xs bg-white p-3 shadow-xs">
            <div className="text-center">
              <div className="flex size-24 items-center justify-center rounded bg-slate-950 p-1">
                <Icon name="QrCode" className="size-20 text-white" />
              </div>
              <span className="mt-1 block font-mono text-[9px] font-semibold text-slate-900">
                {credential.teacherCode}
              </span>
            </div>
          </div>

          <p className="mt-4 text-center text-[9px] text-primary-foreground/70">
            Cartão oficial para registo de assiduidade diária nas instalações escolares.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3">
          <PrintDownloadDropdown
            elementId="teacher-qr-card-sheet"
            filename={`Cartao_Docente_${credential.teacherName.replace(/\s+/g, "_")}.pdf`}
            label="Baixar Cartão (PDF)"
          />
          <Button variant="outline" size="sm" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </div>
    </GlobalModal>
  );
}
