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
        <div id="activity-certificate-print-content" className="sm:col-span-2 space-y-6 rounded-xs border-4 border-double border-amber-400 bg-white p-10 text-center text-slate-900 print:border-0">
          <div className="text-[11px] font-bold uppercase tracking-widest text-slate-600">República de Angola • Ministério da Educação</div>
          <div className="text-lg font-black uppercase">{profile.schoolName}</div>
          <h2 className="font-serif text-2xl font-bold">Certificado de Participação</h2>
          <p className="text-sm leading-relaxed">Certifica-se que o(a) aluno(a) <strong>{target.studentName}</strong> participou na atividade extracurricular <strong>{target.activityName}</strong>, desde {formatDate(target.enrolledAt)}.</p>
          <div className="grid grid-cols-2 gap-8 pt-10 text-xs"><div className="border-t border-slate-400 pt-1">O Responsável da Atividade</div><div className="border-t border-slate-400 pt-1">A Direção</div></div>
          <div className="text-[10px] text-slate-400">Emitido em {formatDate(new Date())}</div>
        </div>
      )}
    </FormModal>
  );
}
