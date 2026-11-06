"use client";
import { formatDateTime } from "@/utils";

import { FormModal } from "@/components";
import { useSchoolSettingsStore } from "@/stores/school/school-settings-store";
import { REQUEST_TYPE_LABEL, type ApiRequest } from "@/services/secretary-requests-service";

/** Comprovativo de entrada com o número de protocolo (folha imprimível). */
export function ProtocolSlipModal({ request }: { request: ApiRequest | null }) {
  const { profile } = useSchoolSettingsStore();

  return (
    <FormModal
      id="request-slip"
      title="Comprovativo de entrada e protocolo"
      description="Pré-visualize e transfira o comprovativo em PDF."
      size="lg"
      submitLabel="Baixar PDF"
      keepOpen
      printContentId="request-slip-print-content"
      pdfFilename={`Comprovativo_Protocolo_${request?.protocol || "pedido"}.pdf`}
      onSubmit={() => {}}
    >
      {request && (
        <div id="request-slip-print-content" className="sm:col-span-2 space-y-5 rounded-lg border border-border bg-card p-6 font-sans text-card-foreground print:border-0">
          <div className="space-y-1 border-b border-border pb-4 text-center">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">República de Angola • Ministério da Educação</div>
            <div className="text-sm font-semibold uppercase">{profile.schoolName}</div>
            <div className="text-[10px] text-muted-foreground">Secretaria-Geral & Protocolo</div>
          </div>
          <div className="rounded-lg border border-border bg-muted/50 p-3">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Número de protocolo</div>
            <div className="font-mono text-xl font-semibold">{request.protocol}</div>
          </div>
          <div className="space-y-2 text-xs">
            <div><span className="text-muted-foreground">Serviço solicitado:</span> <strong>{REQUEST_TYPE_LABEL[request.type]}</strong></div>
            <div><span className="text-muted-foreground">Assunto:</span> <span className="italic">{request.subject}</span></div>
            <div><span className="text-muted-foreground">Data e hora de entrada:</span> <span className="font-medium">{formatDateTime(request.created_at)}</span></div>
          </div>
          <div className="space-y-1 rounded-lg border border-border bg-muted/30 p-3 text-[10px] text-muted-foreground">
            <p>• Apresente este comprovativo e o seu documento de identificação para acompanhar ou levantar o documento.</p>
            <p>• Pode acompanhar o estado do pedido pelo número de protocolo.</p>
          </div>
          <div className="grid grid-cols-2 gap-8 pt-6 text-center text-xs">
            <div className="mx-6 border-t border-border pt-1 text-[10px] font-semibold">O / A Requerente</div>
            <div className="mx-6 border-t border-border pt-1 text-[10px] font-semibold">Pela Secretaria Escolar</div>
          </div>
        </div>
      )}
    </FormModal>
  );
}
