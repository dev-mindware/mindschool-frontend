"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  TitleList,
  DynamicMetricCard,
  PaginatedSelect,
  Button,
  Icon,
} from "@/components";
import { Badge } from "@/components/ui/badge";
import { useSchoolDataStore } from "@/stores/school/school-data-store";
import { useGradeStore } from "@/stores/school/grade-store";
import Link from "next/link";

export function ReportCardsPageContent() {
  const searchParams = useSearchParams();
  const urlStudentId = searchParams.get("studentId");

  const { students } = useSchoolDataStore();
  const { getStudentReportCard } = useGradeStore();

  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    urlStudentId || students[0]?.id || "stu-1"
  );

  useEffect(() => {
    if (urlStudentId) {
      setSelectedStudentId(urlStudentId);
    }
  }, [urlStudentId]);

  // Paginated Student Search
  const [studentSearch, setStudentSearch] = useState("");
  const [studentPage, setStudentPage] = useState(1);
  const STUDENT_PAGE_SIZE = 5;

  const filteredStudents = useMemo(() => {
    return students.filter(
      (stu) =>
        stu.fullName.toLowerCase().includes(studentSearch.toLowerCase()) ||
        stu.studentNumber.toLowerCase().includes(studentSearch.toLowerCase()) ||
        stu.currentSectionName.toLowerCase().includes(studentSearch.toLowerCase())
    );
  }, [students, studentSearch]);

  const totalPages = Math.ceil(filteredStudents.length / STUDENT_PAGE_SIZE) || 1;

  const paginatedStudents = useMemo(() => {
    const start = (studentPage - 1) * STUDENT_PAGE_SIZE;
    return filteredStudents.slice(start, start + STUDENT_PAGE_SIZE);
  }, [filteredStudents, studentPage]);

  const studentOptions = useMemo(() => {
    const opts = paginatedStudents.map((stu) => ({
      value: stu.id,
      label: `${stu.fullName} (${stu.studentNumber})`,
      description: `${stu.currentClassLevel} • ${stu.currentSectionName}`,
    }));

    if (
      selectedStudentId &&
      !opts.some((opt) => opt.value === selectedStudentId)
    ) {
      const selected = students.find((s) => s.id === selectedStudentId);
      if (selected) {
        opts.unshift({
          value: selected.id,
          label: `${selected.fullName} (${selected.studentNumber})`,
          description: `${selected.currentClassLevel} • ${selected.currentSectionName}`,
        });
      }
    }
    return opts;
  }, [paginatedStudents, selectedStudentId, students]);

  // Obter Boletim Oficial
  const reportCard = useMemo(() => {
    return getStudentReportCard(selectedStudentId);
  }, [getStudentReportCard, selectedStudentId]);

  const handlePrint = () => {
    window.print();
  };

  const cleanPhone = (reportCard?.guardianName ? "923456789" : "").replace(/[^0-9]/g, "");

  return (
    <div className="space-y-6">
      {/* Header and Actions */}
      <div className="print:hidden">
        <TitleList
          title="Boletins de Notas & Cadernetas Oficiais"
          suTitle="Emissão oficial de boletins de aproveitamento escolar em conformidade com o Decreto Executivo n.º 424/25."
        >
          <div className="flex items-center gap-2">
            <Link href="/grades/pautas">
              <Button variant="outline" size="sm" className="gap-2">
                <Icon name="ClipboardList" className="h-4 w-4" />
                Pautas Trimestrais
              </Button>
            </Link>
            <Button
              variant="default"
              size="sm"
              onClick={handlePrint}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Icon name="Printer" className="h-4 w-4" />
              Imprimir Boletim Oficial
            </Button>
          </div>
        </TitleList>
      </div>

      {/* Metrics Header */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print:hidden">
        <DynamicMetricCard
          title={reportCard ? `${reportCard.globalFinalScore.toFixed(1)} / 20` : "—"}
          subtitle="Média Final Curricular"
          description={reportCard?.globalQualitative || "Escala 0 a 20"}
          icon="Award"
        />
        <DynamicMetricCard
          title={
            reportCard?.subjects.filter((s) => s.finalScore >= 10).length.toString() || "0"
          }
          subtitle="Disciplinas Aprovadas"
          description={`De um total de ${reportCard?.subjects.length || 0} disciplinas`}
          icon="CircleCheck"
        />
        <DynamicMetricCard
          title={reportCard?.absencesCount.toString() || "0"}
          subtitle="Faltas Registadas"
          description="Assiduidade no ano lectivo"
          icon="Clock"
        />
        <DynamicMetricCard
          title={reportCard?.academicYear || "2025/2026"}
          subtitle="Ano Lectivo"
          description={reportCard?.cycle || "Ensino Geral"}
          icon="Calendar"
        />
      </div>

      {/* Student Selector Bar */}
      <div className="p-4 rounded-lg border bg-card shadow-xs print:hidden space-y-2">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Seleccionar Estudante (Pesquisa Paginada MindGest)
        </label>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex-1 w-full">
            <PaginatedSelect
              options={studentOptions}
              value={selectedStudentId}
              onChange={setSelectedStudentId}
              placeholder="Pesquise estudante por nome, n.º processo ou turma..."
              searchValue={studentSearch}
              onSearchChange={(val) => {
                setStudentSearch(val);
                setStudentPage(1);
              }}
              pagination={{
                page: studentPage,
                totalPages,
              }}
              onPageChange={setStudentPage}
              fullWidth
            />
          </div>

          <a
            href={`https://wa.me/244${cleanPhone || "923456789"}?text=${encodeURIComponent(
              `Prezado(a) ${reportCard?.guardianName || "Encarregado"}, partilhamos o Boletim de Aproveitamento de ${reportCard?.studentName || "estudante"} do Ano Lectivo ${reportCard?.academicYear}. Média Final: ${reportCard?.globalFinalScore.toFixed(1)} valores.`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              variant="outline"
              className="gap-2 text-emerald-700 border-emerald-300 hover:bg-emerald-50 dark:border-emerald-700 dark:hover:bg-emerald-950/20 whitespace-nowrap"
            >
              <Icon name="MessageSquare" className="h-4 w-4" />
              Enviar via WhatsApp
            </Button>
          </a>
        </div>
      </div>

      {/* Official Angolan Report Card Canvas (Print Ready) */}
      {reportCard && (
        <div className="rounded-xl border bg-card p-6 sm:p-8 space-y-6 shadow-sm print:border-none print:shadow-none print:p-0 print:m-0 text-foreground">
          {/* Official Emblem Header */}
          <div className="text-center space-y-1 border-b pb-5">
            <div className="h-14 w-14 mx-auto rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg mb-2">
              <Icon name="Landmark" className="h-7 w-7" />
            </div>
            <h2 className="text-xs uppercase font-bold tracking-widest text-muted-foreground">
              República de Angola
            </h2>
            <h3 className="text-sm uppercase font-semibold text-foreground">
              Ministério da Educação • Governo Provincial de Luanda
            </h3>
            <h1 className="text-lg uppercase font-black tracking-tight text-primary">
              Complexo Escolar Privado MindSchool Luanda
            </h1>
            <p className="text-xs font-medium text-muted-foreground">
              Decreto Executivo n.º 424/25 • Ensino Secundário Geral
            </p>
            <div className="pt-2">
              <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary font-bold text-xs uppercase tracking-wider">
                Boletim Oficial de Aproveitamento Escolar
              </span>
            </div>
          </div>

          {/* Student Dossier Information */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-lg border bg-muted/20 text-xs">
            <div>
              <span className="text-muted-foreground">Nome Completo:</span>
              <p className="font-bold text-foreground text-sm">{reportCard.studentName}</p>
            </div>
            <div>
              <span className="text-muted-foreground">N.º de Matrícula / Processo:</span>
              <p className="font-mono font-bold text-foreground text-sm">
                {reportCard.studentNumber}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Turma e Nível:</span>
              <p className="font-bold text-foreground text-sm">
                {reportCard.classLevel} — {reportCard.sectionName}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Ano Lectivo:</span>
              <p className="font-bold text-foreground text-sm">{reportCard.academicYear}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Ciclo de Ensino:</span>
              <p className="font-medium text-foreground">{reportCard.cycle}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Encarregado de Educação:</span>
              <p className="font-medium text-foreground">{reportCard.guardianName}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Total de Faltas:</span>
              <p className="font-medium text-foreground">
                {reportCard.absencesCount} horas/aula
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Data de Emissão:</span>
              <p className="font-medium text-foreground">
                {new Date(reportCard.issuedAt).toLocaleDateString("pt-AO")}
              </p>
            </div>
          </div>

          {/* Official Grades Grid */}
          <div className="rounded-lg border overflow-hidden">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b bg-muted/60 text-muted-foreground uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-3">Disciplinas Curriculares</th>
                  <th className="py-2.5 px-2 text-center w-20">1.º Trim. (MT1)</th>
                  <th className="py-2.5 px-2 text-center w-20">2.º Trim. (MT2)</th>
                  <th className="py-2.5 px-2 text-center w-20">3.º Trim. (MT3)</th>
                  <th className="py-2.5 px-2 text-center w-24 bg-primary/10">
                    <span className="font-medium text-primary">MFD</span>
                  </th>
                  <th className="py-2.5 px-3 text-center w-36">Avaliação Qualitativa</th>
                  <th className="py-2.5 px-3 text-center w-28">Resultado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {reportCard.subjects.map((subj) => {
                  return (
                    <tr key={subj.subjectId} className="hover:bg-muted/20">
                      <td className="py-2.5 px-3 font-medium text-foreground">
                        {subj.subjectName}
                      </td>
                      <td className="py-2 px-2 text-center font-mono">
                        {subj.mt1 !== undefined ? subj.mt1.toFixed(1) : "—"}
                      </td>
                      <td className="py-2 px-2 text-center font-mono">
                        {subj.mt2 !== undefined ? subj.mt2.toFixed(1) : "—"}
                      </td>
                      <td className="py-2 px-2 text-center font-mono">
                        {subj.mt3 !== undefined ? subj.mt3.toFixed(1) : "—"}
                      </td>
                      <td className="py-2 px-2 text-center font-medium text-foreground font-mono bg-primary/5">
                        <span
                          className={
                            subj.finalScore >= 10
                              ? "text-emerald-700 dark:text-emerald-400 font-medium"
                              : subj.finalScore >= 7
                              ? "text-amber-700 dark:text-amber-400 font-medium"
                              : "text-red-600 dark:text-red-400 font-medium"
                          }
                        >
                          {subj.finalScore.toFixed(1)}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-center text-muted-foreground text-xs font-medium">
                        {subj.qualitativeEvaluation}
                      </td>
                      <td className="py-2 px-3 text-center">
                        {subj.status === "APROVADO" ? (
                          <Badge variant="default" className="text-[10px] bg-emerald-600 text-white">
                            Aprovado
                          </Badge>
                        ) : subj.status === "RECURSO" ? (
                          <Badge
                            variant="outline"
                            className="text-[10px] border-amber-400 text-amber-700 bg-amber-50 dark:bg-amber-950/20"
                          >
                            Recurso
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="text-[10px]">
                            Reprovado
                          </Badge>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Deliberação e Resultado Final do Conselho */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg border bg-muted/30">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Deliberação Oficial do Conselho de Turma
              </span>
              <p className="text-sm font-bold text-foreground">
                {reportCard.finalDecision}
              </p>
              <p className="text-[11px] text-muted-foreground">
                Apreciação homologada sob os termos do Decreto Executivo n.º 424/25 do Ministério da Educação.
              </p>
            </div>
            <div className="flex flex-col justify-center items-start md:items-end space-y-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Média Final do Aluno
              </span>
              <div className="text-2xl font-black text-primary">
                {reportCard.globalFinalScore.toFixed(1)}{" "}
                <span className="text-xs font-normal text-muted-foreground">/ 20 valores</span>
              </div>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                {reportCard.globalQualitative}
              </span>
            </div>
          </div>

          {/* Official Signatures and Stamps */}
          <div className="grid grid-cols-2 gap-8 pt-8 text-center text-xs">
            <div className="space-y-8">
              <p className="text-muted-foreground">O Director Pedagógico</p>
              <div className="border-t border-muted-foreground/40 w-48 mx-auto pt-1 font-semibold text-foreground">
                {reportCard.pedagogicDirectorName}
              </div>
            </div>
            <div className="space-y-8">
              <p className="text-muted-foreground">O Director Geral</p>
              <div className="border-t border-muted-foreground/40 w-48 mx-auto pt-1 font-semibold text-foreground">
                {reportCard.directorGeneralName}
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="text-center text-[10px] text-muted-foreground pt-4 border-t">
            Este boletim é um documento escolar autêntico gerado pelo Sistema de Gestão MindSchool Luanda. Válido com carimbo em óleo e selo branco da instituição de ensino.
          </div>
        </div>
      )}
    </div>
  );
}
