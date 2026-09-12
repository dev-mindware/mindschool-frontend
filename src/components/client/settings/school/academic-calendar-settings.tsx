"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Icon,
} from "@/components";
import { useSchoolSettingsStore } from "@/stores/school";
import { toast } from "sonner";

export function AcademicCalendarSettings() {
  const { calendar, evaluationPolicy, closeTrimester, updateEvaluationPolicy } =
    useSchoolSettingsStore();

  const handleCloseTrimester = (id: string, name: string) => {
    closeTrimester(id);
    toast.success(`${name} encerrado oficialmente! As pautas foram congeladas.`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2 border-b">
        <div>
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <Icon name="Calendar" className="w-5 h-5 text-primary" />
            Calendário Oficial do Ano Lectivo {calendar.academicYear}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Parametrização dos trimestres, períodos de provas e datas-limite de fecho de pautas
          </p>
        </div>
        <Badge variant="outline" className="text-xs font-semibold border-primary/30 text-primary">
          Ano Letivo Ativo
        </Badge>
      </div>

      {/* Trimesters Table Card */}
      <Card className="border shadow-none bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Icon name="Layers" className="w-4 h-4 text-primary" />
            Períodos Trimestrais & Prazos Pedagógicos
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="text-[11px] text-muted-foreground uppercase border-b bg-muted/30">
                <tr>
                  <th className="py-2.5 px-3 font-medium">Trimestre</th>
                  <th className="py-2.5 px-3 font-medium">Início / Fim Aulas</th>
                  <th className="py-2.5 px-3 font-medium">Período de Provas</th>
                  <th className="py-2.5 px-3 font-medium">Prazo Fecho Pautas</th>
                  <th className="py-2.5 px-3 font-medium text-center">Estado</th>
                  <th className="py-2.5 px-3 font-medium text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {calendar.trimesters.map((trim) => (
                  <tr key={trim.id} className="hover:bg-muted/20 transition-colors">
                    <td className="py-2.5 px-3 font-medium text-foreground">
                      {trim.name}
                      {trim.isCurrent && (
                        <span className="ml-2 inline-block px-1.5 py-0.5 rounded text-[9px] bg-primary text-primary-foreground font-medium">
                          Em Curso
                        </span>
                      )}
                    </td>

                    <td className="py-2.5 px-3 text-muted-foreground">
                      {trim.classesStartDate} até {trim.classesEndDate}
                    </td>

                    <td className="py-2.5 px-3 text-muted-foreground font-medium">
                      {trim.examStartDate} até {trim.examEndDate}
                    </td>

                    <td className="py-2.5 px-3 text-rose-700 font-medium">
                      {trim.pautaClosingDeadline}
                    </td>

                    <td className="py-2.5 px-3 text-center">
                      <Badge
                        className={`text-[10px] font-medium ${
                          trim.isClosed
                            ? "bg-muted text-muted-foreground"
                            : trim.isCurrent
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-blue-50 text-blue-800"
                        }`}
                      >
                        {trim.isClosed
                          ? "Encerrado"
                          : trim.isCurrent
                          ? "Decorrendo"
                          : "Agendado"}
                      </Badge>
                    </td>

                    <td className="py-2.5 px-3 text-right">
                      {!trim.isClosed ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCloseTrimester(trim.id, trim.name)}
                          className="h-7 text-xs font-medium border-rose-200 text-rose-700 hover:bg-rose-50"
                        >
                          Fechar Trimestre
                        </Button>
                      ) : (
                        <span className="text-[11px] text-muted-foreground font-medium">
                          Pautas Fechadas
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Evaluation Policy Card (Decreto Presidencial 424/25) */}
      <Card className="border shadow-none bg-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Icon name="ShieldCheck" className="w-4 h-4 text-emerald-600" />
              Parâmetros Regulamentares de Avaliação (Decreto 424/25)
            </CardTitle>
            <Badge variant="outline" className="text-[10px] text-emerald-700 border-emerald-300 bg-emerald-50">
              MED Angola
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3 rounded-lg border bg-muted/20 space-y-1">
            <span className="text-muted-foreground font-medium block">Nota Mínima de Transição</span>
            <span className="text-lg font-bold text-foreground">
              {evaluationPolicy.minimumPassingGrade.toFixed(1)} Valores
            </span>
            <p className="text-[10px] text-muted-foreground">
              Transição direta sem exame de recurso.
            </p>
          </div>

          <div className="p-3 rounded-lg border bg-amber-500/10 border-amber-500/20 space-y-1">
            <span className="text-amber-800 font-medium block">Acesso ao Quadro de Honra</span>
            <span className="text-lg font-bold text-amber-600">
              &ge; {evaluationPolicy.honorRollThreshold.toFixed(1)} Valores
            </span>
            <p className="text-[10px] text-muted-foreground">
              Distinção de mérito e diploma institucional.
            </p>
          </div>

          <div className="p-3 rounded-lg border bg-rose-500/10 border-rose-500/20 space-y-1">
            <span className="text-rose-800 font-medium block">Limite de Faltas Injustificadas</span>
            <span className="text-lg font-bold text-rose-600">
              {evaluationPolicy.unjustifiedAbsenceLimitPercent}% da Carga
            </span>
            <p className="text-[10px] text-muted-foreground">
              Exceder o limite implica retenção automática.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
