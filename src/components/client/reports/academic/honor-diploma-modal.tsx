"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Button,
  Badge,
  Icon,
} from "@/components";
import { HonorRollStudent } from "@/types";

interface HonorDiplomaModalProps {
  student: HonorRollStudent | null;
  isOpen: boolean;
  onClose: () => void;
}

export function HonorDiplomaModal({
  student,
  isOpen,
  onClose,
}: HonorDiplomaModalProps) {
  if (!student) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl sm:max-w-3xl p-0 overflow-hidden border bg-background">
        <DialogHeader className="p-4 border-b bg-muted/30 flex flex-row items-center justify-between">
          <div>
            <DialogTitle className="text-base font-semibold flex items-center gap-2">
              <Icon name="Award" className="w-5 h-5 text-amber-600" />
              Diploma de Reconhecimento e Quadro de Honra
            </DialogTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Distinção ao Mérito Escolar conforme o Decreto Presidencial 424/25
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={handlePrint} className="h-8 text-xs font-medium">
              <Icon name="Printer" className="w-3.5 h-3.5 mr-1.5" />
              Imprimir Diploma
            </Button>
          </div>
        </DialogHeader>

        {/* Certificate printable preview frame */}
        <div className="p-6 sm:p-10 flex justify-center bg-muted/10 print:p-0">
          <div className="w-full max-w-xl bg-card border-4 border-double border-amber-600/40 p-8 rounded-xl shadow-lg relative space-y-6 text-center">
            {/* Header / Republic */}
            <div className="space-y-1">
              <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold">
                República de Angola
              </p>
              <p className="text-xs font-bold uppercase text-foreground">
                Ministério da Educação • Colégio Privado MindSchool
              </p>
              <div className="w-16 h-0.5 bg-amber-600 mx-auto my-2" />
              <h2 className="text-2xl sm:text-3xl font-serif font-black tracking-wide text-amber-700 uppercase pt-2">
                Diploma de Mérito
              </h2>
              <p className="text-xs italic text-muted-foreground">
                Quadro de Honra e Excelência Académica
              </p>
            </div>

            {/* Certificate Body */}
            <div className="space-y-4 text-xs sm:text-sm text-foreground leading-relaxed pt-2">
              <p>
                A Direcção do <strong>Colégio Privado MindSchool</strong> confere o presente
                diploma de distinção académica ao(à) aluno(a):
              </p>

              <div className="py-2.5 px-4 bg-amber-500/10 rounded-lg border border-amber-500/20 max-w-md mx-auto">
                <h3 className="text-lg sm:text-xl font-bold text-foreground">
                  {student.studentName}
                </h3>
                <p className="text-xs text-muted-foreground">
                  Processo Escolar Nº: <strong>{student.studentNumber}</strong> • {student.className}
                </p>
              </div>

              <p className="max-w-md mx-auto text-xs text-muted-foreground">
                Pelo notável desempenho escolar obtido no{" "}
                <strong className="text-foreground">
                  {student.trimester === "1_TRIMESTRE"
                    ? "1º Trimestre"
                    : student.trimester === "2_TRIMESTRE"
                    ? "2º Trimestre"
                    : "3º Trimestre"}
                </strong>{" "}
                do Ano Lectivo <strong className="text-foreground">{student.academicYear}</strong>,
                atingindo a classificação média final de:
              </p>

              <div className="flex items-center justify-center gap-3">
                <div className="inline-flex items-baseline gap-1 py-1.5 px-5 rounded-full bg-amber-600 text-white font-bold text-lg shadow-sm">
                  <span>{student.generalAverage.toFixed(1)}</span>
                  <span className="text-xs font-normal opacity-90">Valores</span>
                </div>
                <Badge variant="outline" className="border-emerald-600 text-emerald-700 bg-emerald-50 text-xs font-medium">
                  Conduta: {student.conduct}
                </Badge>
              </div>

              <p className="text-[11px] text-muted-foreground max-w-sm mx-auto">
                Maior destaque na disciplina de{" "}
                <strong className="text-foreground">
                  {student.bestSubject.name} ({student.bestSubject.grade.toFixed(1)} val.)
                </strong>{" "}
                com um total de {student.totalDistinctions} distinções por mérito.
              </p>
            </div>

            {/* Signature blocks */}
            <div className="grid grid-cols-2 gap-8 pt-8 text-[11px] text-muted-foreground border-t border-muted">
              <div>
                <div className="w-36 h-0.5 bg-muted-foreground/40 mx-auto mb-1.5" />
                <p className="font-semibold text-foreground">Dr. Alberto Manuel</p>
                <p>Diretor Geral</p>
              </div>
              <div>
                <div className="w-36 h-0.5 bg-muted-foreground/40 mx-auto mb-1.5" />
                <p className="font-semibold text-foreground">Profª. Maria Teresa Diogo</p>
                <p>Diretora Pedagógica</p>
              </div>
            </div>

            <div className="text-[10px] text-muted-foreground text-right pt-2">
              Luanda, aos {new Date().toLocaleDateString("pt-AO", { day: "numeric", month: "long", year: "numeric" })}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
