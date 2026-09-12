"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Button,
  Icon,
} from "@/components";
import { HonorRollStudent } from "@/types";

interface HonorRollTableProps {
  students: HonorRollStudent[];
  onSelectStudent: (student: HonorRollStudent) => void;
}

export function HonorRollTable({
  students,
  onSelectStudent,
}: HonorRollTableProps) {
  if (!students || students.length === 0) {
    return (
      <Card className="border shadow-none bg-card p-6 text-center text-muted-foreground text-xs">
        Nenhum aluno registado no Quadro de Honra para os filtros selecionados.
      </Card>
    );
  }

  // Sort descending by average
  const sortedStudents = [...students].sort(
    (a, b) => b.generalAverage - a.generalAverage
  );

  return (
    <Card className="border shadow-none bg-card">
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
              <Icon name="Award" className="w-5 h-5 text-amber-600" />
              Quadro de Honra & Mérito Escolar (Média &ge; 16.0 Valores)
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Alunos que atingiram o patamar de excelência académica conforme o Decreto Presidencial 424/25
            </p>
          </div>
          <Badge className="bg-amber-600 text-white font-semibold text-xs shrink-0">
            {students.length} Alunos Distintos
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-2">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-[11px] text-muted-foreground uppercase border-b bg-muted/30">
              <tr>
                <th className="py-2.5 px-3 font-medium text-center w-12">Pos.</th>
                <th className="py-2.5 px-3 font-medium">Aluno / Nº Processo</th>
                <th className="py-2.5 px-3 font-medium">Turma / Ciclo</th>
                <th className="py-2.5 px-3 font-medium text-center">Média Geral</th>
                <th className="py-2.5 px-3 font-medium">Maior Destaque</th>
                <th className="py-2.5 px-3 font-medium text-center">Conduta</th>
                <th className="py-2.5 px-3 font-medium text-right">Diploma</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {sortedStudents.map((student, idx) => {
                const rank = idx + 1;
                const isTop3 = rank <= 3;

                return (
                  <tr
                    key={student.id}
                    className="hover:bg-muted/20 transition-colors"
                  >
                    <td className="py-2.5 px-3 text-center font-medium">
                      {isTop3 ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-900 text-xs font-medium">
                          {rank}º
                        </span>
                      ) : (
                        <span className="text-muted-foreground">{rank}º</span>
                      )}
                    </td>

                    <td className="py-2.5 px-3 font-medium text-foreground">
                      <div className="font-medium">{student.studentName}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {student.studentNumber}
                      </div>
                    </td>

                    <td className="py-2.5 px-3">
                      <div className="font-medium text-foreground">
                        {student.className}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {student.cycleLabel}
                      </div>
                    </td>

                    <td className="py-2.5 px-3 text-center">
                      <span className="inline-flex items-center gap-1 font-mono font-medium px-2 py-0.5 rounded text-xs bg-amber-500/15 text-amber-800 border border-amber-500/30">
                        <Icon name="Star" className="w-3 h-3 text-amber-600 fill-amber-500" />
                        {student.generalAverage.toFixed(1)} val.
                      </span>
                    </td>

                    <td className="py-2.5 px-3">
                      <span className="font-medium text-foreground">
                        {student.bestSubject.name}
                      </span>
                      <span className="text-muted-foreground text-[11px] block">
                        {student.bestSubject.grade.toFixed(1)} valores ({student.totalDistinctions} distinções)
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-center">
                      <Badge
                        variant="secondary"
                        className="text-[10px] bg-emerald-50 text-emerald-800 border-emerald-200"
                      >
                        {student.conduct}
                      </Badge>
                    </td>

                    <td className="py-2.5 px-3 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onSelectStudent(student)}
                        className="h-7 text-xs px-2.5 font-medium border-amber-600/30 text-amber-800 hover:bg-amber-50"
                      >
                        <Icon name="Award" className="w-3.5 h-3.5 mr-1" />
                        Ver Diploma
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
