"use client";
import { formatDate } from "@/utils";

import { FormModal } from "@/components";
import { useSchoolSettingsStore } from "@/stores/school/school-settings-store";
import type { CertificateTarget } from "./extracurricular-page-content";

/** Certificado de participação (folha A4 imprimível). */
export function ActivityCertificatePrintModal({ target }: { target?: CertificateTarget | null }) {
  const { profile } = useSchoolSettingsStore();

  return (
    <FormModal
      id="activity-certificate"
      title="Certificado de participação"
      description="Pré-visualize e transfira o certificado em PDF."
      size="lg"
      submitLabel="Baixar PDF"
      keepOpen
      printContentId="activity-certificate-print-content"
      pdfFilename={`Certificado_${target?.studentName || "participacao"}.pdf`}
      onSubmit={() => {}}
    >
      {target && (
        <div id="activity-certificate-print-content" className="sm:col-span-2 space-y-6 rounded-lg border-4 border-double border-primary/50 bg-card p-10 text-center text-card-foreground print:border-0">
          <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">República de Angola • Ministério da Educação</div>
          <div className="text-lg font-semibold uppercase">{profile.schoolName}</div>
          <h2 className="font-serif text-2xl font-semibold">Certificado de Participação</h2>
          <p className="text-sm leading-relaxed">Certifica-se que o(a) aluno(a) <strong>{target.studentName}</strong> participou na actividade extracurricular <strong>{target.activityName}</strong>, desde {formatDate(target.enrolledAt)}.</p>
          <div className="grid grid-cols-2 gap-8 pt-10 text-xs"><div className="border-t border-border pt-1">O Responsável da Actividade</div><div className="border-t border-border pt-1">A Direcção</div></div>
          <div className="text-[10px] text-muted-foreground">Emitido em {formatDate(new Date())}</div>
        </div>
      )}
    </FormModal>
  );
}
