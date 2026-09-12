'use client';

import React, { useState, useMemo } from 'react';
import { 
  DynamicMetricCard, 
  GenericTable, 
  TitleList, 
  GlobalModal, 
  SelectField, 
  Button, 
  Badge, 
  Icon 
} from '@/components';
import { SearchHandlerWrapper } from '@/components/common';
import { FilterPopover } from '@/components/shared';
import { useOnlineExamStore } from '@/stores/school/online-exam-store';
import { useSchoolDataStore } from '@/stores/school/school-data-store';
import { 
  OnlineExam, 
  ExamStatus, 
  QuestionType, 
  StudentExamSubmission 
} from '@/types/online-exam';

export function OnlineExamsPageContent() {
  const { 
    exams, 
    submissions, 
    filterStatus, 
    searchQuery, 
    setStatusFilter, 
    setSearchQuery, 
    createExam, 
    addQuestion, 
    updateExamStatus, 
    submitStudentExam, 
    gradeEssayQuestion, 
    pushScoreToGradebook, 
    getMetrics 
  } = useOnlineExamStore();

  const { sections } = useSchoolDataStore();
  const metrics = getMetrics();

  // Modais
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAddQuestionModalOpen, setIsAddQuestionModalOpen] = useState(false);
  const [isStudentSimulatorOpen, setIsStudentSimulatorOpen] = useState(false);
  const [isGradingModalOpen, setIsGradingModalOpen] = useState(false);

  // Estados de Seleção
  const [activeExam, setActiveExam] = useState<OnlineExam | null>(null);
  const [activeSubmission, setActiveSubmission] = useState<StudentExamSubmission | null>(null);

  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 6;

  // Formulário de Criação de Prova
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('Matemática');
  const [newSectionId, setNewSectionId] = useState(sections[0]?.id || 'sec-7a');
  const [newDuration, setNewDuration] = useState(60);
  const [newTerm, setNewTerm] = useState<1 | 2 | 3>(1);

  // Formulário de Adicionar Pergunta
  const [qType, setQType] = useState<QuestionType>('MULTIPLE_CHOICE');
  const [qPrompt, setQPrompt] = useState('');
  const [qPoints, setQPoints] = useState(5.0);
  const [qCorrectAnswer, setQCorrectAnswer] = useState('opt-a');
  const [qRubric, setQRubric] = useState('');
  const [qOptions, setQOptions] = useState([
    { id: 'opt-a', label: 'A', text: '' },
    { id: 'opt-b', label: 'B', text: '' },
    { id: 'opt-c', label: 'C', text: '' },
    { id: 'opt-d', label: 'D', text: '' },
  ]);

  // Estados do Simulador de Exame do Aluno
  const [simulatorAnswers, setSimulatorAnswers] = useState<Record<string, string>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Estados da Mesa de Correcção
  const [essayScoreInputs, setEssayScoreInputs] = useState<Record<string, number>>({});
  const [essayFeedbackInputs, setEssayFeedbackInputs] = useState<Record<string, string>>({});

  // Filtros
  const filteredExams = useMemo(() => {
    return exams.filter((exam) => {
      const matchesStatus = filterStatus === 'ALL' || exam.status === filterStatus;
      const matchesQuery = 
        exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exam.subjectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exam.className.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesStatus && matchesQuery;
    });
  }, [exams, filterStatus, searchQuery]);

  const totalPages = Math.ceil(filteredExams.length / PAGE_SIZE) || 1;
  const paginatedExams = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredExams.slice(start, start + PAGE_SIZE);
  }, [filteredExams, currentPage]);

  const handleOpenCreateExam = () => {
    setNewTitle('');
    setNewSubject('Matemática');
    setNewSectionId(sections[0]?.id || 'sec-7a');
    setNewDuration(60);
    setNewTerm(1);
    setIsCreateModalOpen(true);
  };

  const handleSaveExam = (e: React.FormEvent) => {
    e.preventDefault();
    const section = sections.find((s) => s.id === newSectionId);
    if (!newTitle.trim()) return;

    const created = createExam({
      title: newTitle,
      subjectId: `sub-${newSubject.toLowerCase().slice(0, 3)}`,
      subjectName: newSubject,
      classId: newSectionId,
      className: section ? `${section.classLevel} - ${section.name}` : '7ª Classe A',
      term: newTerm,
      academicYear: '2025/2026',
      durationMinutes: newDuration,
      totalPoints: 20.0,
      passingPoints: 10.0,
      status: 'DRAFT',
      startDate: new Date().toISOString().slice(0, 16).replace('T', ' '),
      endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16).replace('T', ' '),
      createdByTeacherId: 'tch-01',
      createdByTeacherName: 'Docente Responsável',
    });

    setIsCreateModalOpen(false);
    setActiveExam(created);
    setIsAddQuestionModalOpen(true);
  };

  const handleOpenAddQuestion = (exam: OnlineExam) => {
    setActiveExam(exam);
    setQPrompt('');
    setQPoints(5.0);
    setQType('MULTIPLE_CHOICE');
    setQCorrectAnswer('opt-a');
    setQRubric('');
    setQOptions([
      { id: 'opt-a', label: 'A', text: '' },
      { id: 'opt-b', label: 'B', text: '' },
      { id: 'opt-c', label: 'C', text: '' },
      { id: 'opt-d', label: 'D', text: '' },
    ]);
    setIsAddQuestionModalOpen(true);
  };

  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeExam || !qPrompt.trim()) return;

    addQuestion(activeExam.id, {
      type: qType,
      prompt: qPrompt,
      points: Number(qPoints),
      options: qType === 'MULTIPLE_CHOICE' ? qOptions : undefined,
      correctAnswer: qType === 'MULTIPLE_CHOICE' || qType === 'TRUE_FALSE' || qType === 'SHORT_ANSWER' ? qCorrectAnswer : undefined,
      rubricCriteria: qType === 'ESSAY' ? qRubric : undefined,
    });

    setIsAddQuestionModalOpen(false);
  };

  const handleOpenSimulator = (exam: OnlineExam) => {
    setActiveExam(exam);
    setSimulatorAnswers({});
    setCurrentQuestionIndex(0);
    setIsStudentSimulatorOpen(true);
  };

  const handleSubmitSimulation = () => {
    if (!activeExam) return;

    const sub = submitStudentExam(activeExam.id, 'std-simulated-01', simulatorAnswers);
    setIsStudentSimulatorOpen(false);
    setActiveSubmission(sub);
    setIsGradingModalOpen(true);
  };

  const handleOpenGrading = (exam: OnlineExam) => {
    setActiveExam(exam);
    const sub = submissions.find((s) => s.examId === exam.id) || submissions[0];
    if (sub) {
      setActiveSubmission(sub);
      setEssayScoreInputs(sub.essayScores || {});
      setEssayFeedbackInputs(sub.essayFeedback || {});
      setIsGradingModalOpen(true);
    }
  };

  const handleSaveEssayGrade = (questionId: string, maxPoints: number) => {
    if (!activeSubmission) return;
    const score = Math.min(maxPoints, Math.max(0, essayScoreInputs[questionId] || 0));
    const feedback = essayFeedbackInputs[questionId] || '';

    gradeEssayQuestion(activeSubmission.id, questionId, score, feedback);
    // Atualiza a submissão ativa
    const updated = useOnlineExamStore.getState().submissions.find((s) => s.id === activeSubmission.id);
    if (updated) setActiveSubmission(updated);
  };

  const handlePushToPauta = () => {
    if (!activeSubmission) return;
    pushScoreToGradebook(activeSubmission.id);
    const updated = useOnlineExamStore.getState().submissions.find((s) => s.id === activeSubmission.id);
    if (updated) setActiveSubmission(updated);
  };

  const hasFilter = Boolean(searchQuery.trim() || filterStatus !== 'ALL');

  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('ALL');
    setCurrentPage(1);
  };

  const getExamStatusBadge = (status: ExamStatus) => {
    switch (status) {
      case 'PUBLISHED':
        return (
          <Badge variant="outline" className="border-blue-500/30 text-blue-600 bg-blue-500/10 text-xs font-normal">
            Publicada
          </Badge>
        );
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Em Curso
          </span>
        );
      case 'GRADED':
        return (
          <Badge variant="outline" className="border-purple-500/30 text-purple-600 bg-purple-500/10 text-xs font-normal">
            Corrigida
          </Badge>
        );
      case 'CLOSED':
        return <Badge variant="secondary" className="text-xs font-normal">Encerrada</Badge>;
      case 'DRAFT':
        return (
          <Badge variant="outline" className="border-amber-500/30 text-amber-600 bg-amber-500/10 text-xs font-normal">
            Rascunho
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* MindGest Standard TitleList Header */}
      <TitleList
        title="Avaliações & Provas Online"
        suTitle="Elabore avaliações digitais com perguntas de escolha múltipla, V/F e dissertativas com lançamento automático na mini-pauta."
      >
        <Button
          variant="default"
          size="sm"
          onClick={handleOpenCreateExam}
          className="gap-2 shadow-xs text-xs font-semibold"
        >
          <Icon name="Plus" className="size-4" />
          Criar Nova Prova
        </Button>
      </TitleList>

      {/* 4 Cards de Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DynamicMetricCard
          title={metrics.totalExams}
          subtitle="Provas Criadas"
          description="Neste trimestre lectivo"
          icon="FileSpreadsheet"
        />
        <DynamicMetricCard
          title={metrics.activeExamsCount}
          subtitle="Provas Activas / Em Curso"
          description="Disponíveis para os alunos"
          icon="Clock"
        />
        <DynamicMetricCard
          title={`${metrics.autoGradingAccuracyPercentage}%`}
          subtitle="Taxa de Correcção Automática"
          description="Média instantânea de objetivas"
          icon="Zap"
        />
        <DynamicMetricCard
          title={`${metrics.averageScore} val`}
          subtitle="Média Geral dos Alunos"
          description="Escala de 0 a 20 do Decreto 424/25"
          icon="Award"
        />
      </div>

      {/* MindGest Standard Filters Toolbar */}
      <div className="w-full flex flex-col sm:flex-row gap-3 items-center justify-between">
        <SearchHandlerWrapper
          search={searchQuery}
          setSearch={(q) => {
            setSearchQuery(q);
            setCurrentPage(1);
          }}
          placeholder="Pesquisar por título, disciplina ou turma..."
          className="w-full sm:max-w-xs md:max-w-sm"
        />

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <FilterPopover
            label="Estado"
            icon="ListFilter"
            options={[
              { label: 'Todos os Estados', value: 'ALL' },
              { label: 'Publicadas', value: 'PUBLISHED' },
              { label: 'Em Curso', value: 'IN_PROGRESS' },
              { label: 'Corrigidas / Finalizadas', value: 'GRADED' },
              { label: 'Rascunhos', value: 'DRAFT' },
            ]}
            value={filterStatus === 'ALL' ? null : filterStatus}
            onChange={(val) => {
              setStatusFilter((val as ExamStatus) ?? 'ALL');
              setCurrentPage(1);
            }}
          />

          {hasFilter && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleClearFilters}
              className="h-10 text-xs text-muted-foreground hover:text-foreground"
            >
              <Icon name="X" className="w-3.5 h-3.5 mr-1" />
              Limpar
            </Button>
          )}
        </div>
      </div>

      {/* Tabela de Provas Online */}
      <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
        <GenericTable<OnlineExam>
          data={paginatedExams}
          page={currentPage}
          totalPages={totalPages}
          total={filteredExams.length}
          setPage={setCurrentPage}
          goToNextPage={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          goToPreviousPage={() => setCurrentPage((p) => Math.max(1, p - 1))}
          columns={[
            {
              key: 'title',
              header: 'Prova & Disciplina',
              render: (_, item) => (
                <div>
                  <p className="font-medium text-foreground text-sm leading-snug">{item.title}</p>
                  <p className="text-xs text-muted-foreground font-mono">{item.subjectName} • {item.term}.º Trimestre</p>
                </div>
              ),
            },
            {
              key: 'class',
              header: 'Turma & Docente',
              render: (_, item) => (
                <div className="text-xs">
                  <p className="font-medium text-foreground">{item.className}</p>
                  <p className="text-muted-foreground">{item.createdByTeacherName}</p>
                </div>
              ),
            },
            {
              key: 'questionsCount',
              header: 'Questões & Duração',
              render: (_, item) => (
                <div className="text-xs">
                  <p className="font-mono font-medium text-foreground">{item.questions.length} questões ({item.totalPoints.toFixed(1)} val)</p>
                  <p className="text-muted-foreground">{item.durationMinutes} minutos de tempo limite</p>
                </div>
              ),
            },
            {
              key: 'status',
              header: 'Estado',
              render: (_, item) => getExamStatusBadge(item.status),
            },
            {
              key: 'actions',
              header: 'Ações',
              className: 'text-right',
              render: (_, item) => (
                <div className="flex items-center justify-end gap-1.5">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleOpenAddQuestion(item)}
                    className="h-8 gap-1 text-xs"
                    title="Adicionar Questões à Prova"
                  >
                    <Icon name="Plus" className="w-3.5 h-3.5" />
                    Questões
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleOpenSimulator(item)}
                    className="h-8 gap-1 text-xs hover:text-foreground"
                    title="Simular Realização pelo Aluno"
                  >
                    <Icon name="Play" className="w-3.5 h-3.5" />
                    Simular
                  </Button>

                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => handleOpenGrading(item)}
                    className="h-8 gap-1 text-xs"
                    title="Mesa de Correcção e Lançamento"
                  >
                    <Icon name="CheckCheck" className="w-3.5 h-3.5" />
                    Corrigir
                  </Button>
                </div>
              ),
            },
          ]}
          emptyMessage="Nenhuma prova online encontrada com os filtros atuais."
        />
      </div>

      {/* Modal 1: Criar Nova Prova */}
      <GlobalModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Criar Nova Avaliação Digital"
        className="!w-[95vw] sm:!max-w-2xl lg:!max-w-3xl"
      >
        <form onSubmit={handleSaveExam} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Título da Avaliação *
            </label>
            <input
              type="text"
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Ex: 2.ª Prova Parcial de Matemática - Geometria Espacial"
              className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-hidden focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SelectField
              label="Disciplina"
              value={newSubject}
              onValueChange={(val) => setNewSubject(val)}
              options={[
                { label: 'Matemática', value: 'Matemática' },
                { label: 'Língua Portuguesa', value: 'Língua Portuguesa' },
                { label: 'Física', value: 'Física' },
                { label: 'Química', value: 'Química' },
                { label: 'Biologia', value: 'Biologia' },
                { label: 'História', value: 'História' },
              ]}
            />

            <SelectField
              label="Turma Destinatária"
              value={newSectionId}
              onValueChange={(val) => setNewSectionId(val)}
              options={sections.map((s) => ({
                label: `${s.classLevel} - ${s.name} (${s.shift})`,
                value: s.id,
              }))}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Duração da Prova (Minutos)
              </label>
              <input
                type="number"
                min={15}
                max={180}
                value={newDuration}
                onChange={(e) => setNewDuration(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-hidden focus:ring-1 focus:ring-primary font-mono"
              />
            </div>

            <SelectField
              label="Trimestre Escolar"
              value={newTerm.toString()}
              onValueChange={(val) => setNewTerm(Number(val) as 1 | 2 | 3)}
              options={[
                { label: '1.º Trimestre', value: '1' },
                { label: '2.º Trimestre', value: '2' },
                { label: '3.º Trimestre', value: '3' },
              ]}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Button variant="outline" type="button" onClick={() => setIsCreateModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="gap-2">
              <Icon name="Check" className="w-4 h-4" />
              Criar & Adicionar Questões
            </Button>
          </div>
        </form>
      </GlobalModal>

      {/* Modal 2: Adicionar Questão ao Construtor */}
      <GlobalModal
        isOpen={isAddQuestionModalOpen}
        onClose={() => setIsAddQuestionModalOpen(false)}
        title={activeExam ? `Adicionar Questão: ${activeExam.title}` : 'Adicionar Questão'}
        className="!w-[95vw] sm:!max-w-2xl lg:!max-w-3xl"
      >
        <form onSubmit={handleSaveQuestion} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SelectField
              label="Tipo de Questão"
              value={qType}
              onValueChange={(val) => setQType(val as QuestionType)}
              options={[
                { label: 'Escolha Múltipla (A, B, C, D)', value: 'MULTIPLE_CHOICE' },
                { label: 'Verdadeiro ou Falso (V/F)', value: 'TRUE_FALSE' },
                { label: 'Resposta Curta (Texto/Número)', value: 'SHORT_ANSWER' },
                { label: 'Dissertativa / Desenvolvimento', value: 'ESSAY' },
              ]}
            />

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Pontuação da Questão (Valores no Decreto 424/25)
              </label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="20"
                value={qPoints}
                onChange={(e) => setQPoints(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-hidden focus:ring-1 focus:ring-primary font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Enunciado / Pergunta *
            </label>
            <textarea
              required
              rows={3}
              value={qPrompt}
              onChange={(e) => setQPrompt(e.target.value)}
              placeholder="Digite a pergunta ou problema a ser resolvido pelo aluno..."
              className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-hidden focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Configuração de Escolha Múltipla */}
          {qType === 'MULTIPLE_CHOICE' && (
            <div className="space-y-3 p-4 bg-muted/30 rounded-xl border border-border">
              <span className="text-xs font-bold text-foreground">Opções de Resposta & Chave Correcta:</span>
              <div className="space-y-2">
                {qOptions.map((opt, idx) => (
                  <div key={opt.id} className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0">
                      {opt.label}
                    </span>
                    <input
                      type="text"
                      placeholder={`Texto da opção ${opt.label}...`}
                      value={opt.text}
                      onChange={(e) => {
                        const updated = [...qOptions];
                        updated[idx].text = e.target.value;
                        setQOptions(updated);
                      }}
                      className="flex-1 px-3 py-1.5 text-sm rounded-md border border-border bg-background"
                    />
                    <label className="flex items-center gap-1 text-xs cursor-pointer">
                      <input
                        type="radio"
                        name="correctOpt"
                        checked={qCorrectAnswer === opt.id}
                        onChange={() => setQCorrectAnswer(opt.id)}
                      />
                      <span className={qCorrectAnswer === opt.id ? 'font-bold text-emerald-600' : 'text-muted-foreground'}>
                        Correcta
                      </span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Configuração de V/F */}
          {qType === 'TRUE_FALSE' && (
            <div className="p-4 bg-muted/30 rounded-xl border border-border space-y-2">
              <span className="text-xs font-bold text-foreground">Gabarito da Questão:</span>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                  <input
                    type="radio"
                    name="tfCorrect"
                    checked={qCorrectAnswer === 'TRUE'}
                    onChange={() => setQCorrectAnswer('TRUE')}
                  />
                  Verdadeiro (V)
                </label>
                <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                  <input
                    type="radio"
                    name="tfCorrect"
                    checked={qCorrectAnswer === 'FALSE'}
                    onChange={() => setQCorrectAnswer('FALSE')}
                  />
                  Falso (F)
                </label>
              </div>
            </div>
          )}

          {/* Configuração de Resposta Curta */}
          {qType === 'SHORT_ANSWER' && (
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Resposta Exacta Esperada (Correcção Automática) *
              </label>
              <input
                type="text"
                required
                value={qCorrectAnswer}
                onChange={(e) => setQCorrectAnswer(e.target.value)}
                placeholder="Ex: 7 ou segundo ou Luanda"
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background font-mono"
              />
            </div>
          )}

          {/* Configuração de Dissertativa */}
          {qType === 'ESSAY' && (
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Critérios de Avaliação e Rubrica (Para Orientar a Correcção do Docente)
              </label>
              <textarea
                rows={2}
                value={qRubric}
                onChange={(e) => setQRubric(e.target.value)}
                placeholder="Ex: Coerência argumentativa (2 val), domínio da gramática (2 val), fundamentação (2 val)..."
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background"
              />
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Button variant="outline" type="button" onClick={() => setIsAddQuestionModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="gap-2">
              <Icon name="Plus" className="w-4 h-4" />
              Guardar Pergunta na Prova
            </Button>
          </div>
        </form>
      </GlobalModal>

      {/* Modal 3: Simulador de Realização da Prova pelo Aluno */}
      <GlobalModal
        isOpen={isStudentSimulatorOpen}
        onClose={() => setIsStudentSimulatorOpen(false)}
        title={activeExam ? `Exame do Aluno: ${activeExam.title}` : 'Simulador de Exame'}
        className="!w-[95vw] sm:!max-w-2xl lg:!max-w-3xl"
      >
        {activeExam && activeExam.questions.length > 0 && (
          <div className="space-y-6">
            {/* Barra de Status do Exame */}
            <div className="p-3 bg-slate-900 text-white rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Icon name="Clock" className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span>Tempo Restante: <strong className="font-mono text-emerald-400">00:44:12</strong></span>
              </div>
              <div className="font-mono text-slate-300">
                Questão {currentQuestionIndex + 1} de {activeExam.questions.length}
              </div>
              <div className="text-[11px] text-slate-400">
                Auto-salvo localmente ✅
              </div>
            </div>

            {/* Pergunta Corrente */}
            {(() => {
              const q = activeExam.questions[currentQuestionIndex];
              if (!q) return null;

              return (
                <div className="p-6 rounded-xl border border-border bg-card space-y-4 shadow-xs">
                  <div className="flex items-center justify-between border-b border-border pb-2">
                    <span className="font-bold text-sm text-foreground">
                      Questão {currentQuestionIndex + 1} ({q.points.toFixed(1)} valores)
                    </span>
                    <Badge variant="outline">{q.type}</Badge>
                  </div>

                  <p className="text-sm font-medium text-foreground leading-relaxed">{q.prompt}</p>

                  {/* Resposta de Escolha Múltipla */}
                  {q.type === 'MULTIPLE_CHOICE' && q.options && (
                    <div className="space-y-2 pt-2">
                      {q.options.map((opt) => (
                        <label
                          key={opt.id}
                          className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                            simulatorAnswers[q.id] === opt.id
                              ? 'border-primary bg-primary/5 font-semibold text-primary'
                              : 'border-border hover:bg-muted/50 text-foreground'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`sim-${q.id}`}
                            checked={simulatorAnswers[q.id] === opt.id}
                            onChange={() => setSimulatorAnswers({ ...simulatorAnswers, [q.id]: opt.id })}
                            className="text-primary"
                          />
                          <span className="font-mono">{opt.label})</span>
                          <span className="text-sm">{opt.text}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {/* Resposta V/F */}
                  {q.type === 'TRUE_FALSE' && (
                    <div className="flex gap-4 pt-2">
                      {['TRUE', 'FALSE'].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setSimulatorAnswers({ ...simulatorAnswers, [q.id]: val })}
                          className={`flex-1 py-3 px-4 rounded-lg border font-semibold text-sm transition-colors ${
                            simulatorAnswers[q.id] === val
                              ? 'border-primary bg-primary text-white'
                              : 'border-border bg-background hover:bg-muted text-foreground'
                          }`}
                        >
                          {val === 'TRUE' ? 'Verdadeiro (V)' : 'Falso (F)'}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Resposta Curta */}
                  {q.type === 'SHORT_ANSWER' && (
                    <div className="pt-2">
                      <input
                        type="text"
                        placeholder="Digite a sua resposta..."
                        value={simulatorAnswers[q.id] || ''}
                        onChange={(e) => setSimulatorAnswers({ ...simulatorAnswers, [q.id]: e.target.value })}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background font-mono"
                      />
                    </div>
                  )}

                  {/* Resposta Dissertativa */}
                  {q.type === 'ESSAY' && (
                    <div className="pt-2">
                      <textarea
                        rows={5}
                        placeholder="Escreva aqui o seu desenvolvimento completo..."
                        value={simulatorAnswers[q.id] || ''}
                        onChange={(e) => setSimulatorAnswers({ ...simulatorAnswers, [q.id]: e.target.value })}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background"
                      />
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Navegação entre Questões */}
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                disabled={currentQuestionIndex === 0}
                onClick={() => setCurrentQuestionIndex((i) => Math.max(0, i - 1))}
              >
                Anterior
              </Button>

              <div className="flex gap-1">
                {activeExam.questions.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentQuestionIndex(idx)}
                    className={`w-7 h-7 rounded-md text-xs font-mono font-semibold transition-colors ${
                      idx === currentQuestionIndex
                        ? 'bg-primary text-white'
                        : simulatorAnswers[activeExam.questions[idx].id]
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>

              {currentQuestionIndex < activeExam.questions.length - 1 ? (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setCurrentQuestionIndex((i) => Math.min(activeExam.questions.length - 1, i + 1))}
                >
                  Seguinte
                </Button>
              ) : (
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleSubmitSimulation}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                >
                  <Icon name="CircleCheck" className="w-4 h-4" />
                  Finalizar & Submeter
                </Button>
              )}
            </div>
          </div>
        )}
      </GlobalModal>

      {/* Modal 4: Mesa de Correcção e Lançamento na Pauta Oficial */}
      <GlobalModal
        isOpen={isGradingModalOpen}
        onClose={() => setIsGradingModalOpen(false)}
        title={activeSubmission ? `Mesa de Correcção: ${activeSubmission.studentName}` : 'Mesa de Correcção'}
        className="!w-[95vw] sm:!max-w-2xl lg:!max-w-4xl"
      >
        {activeSubmission && activeExam && (
          <div className="space-y-6">
            {/* Resumo da Nota */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono text-muted-foreground">{activeSubmission.studentNumber}</span>
                <h3 className="text-base font-bold text-foreground">{activeSubmission.studentName}</h3>
                <p className="text-xs text-muted-foreground">{activeExam.title} • Submetido em: {activeSubmission.submittedAt}</p>
              </div>

              <div className="text-right">
                <span className="text-xs uppercase font-bold tracking-wider text-muted-foreground block">Nota Final</span>
                <span className={`text-3xl font-extrabold font-mono ${
                  activeSubmission.totalScore >= 10 ? 'text-emerald-600' : 'text-rose-600'
                }`}>
                  {activeSubmission.totalScore.toFixed(1)} <span className="text-xs font-normal text-muted-foreground">/ 20 val</span>
                </span>
              </div>
            </div>

            {/* Revisão Questão a Questão */}
            <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
              {activeExam.questions.map((q, idx) => {
                const studentAns = activeSubmission.answers[q.id];
                const isObjective = q.type !== 'ESSAY';
                const isCorrect = isObjective && studentAns && (
                  q.type === 'SHORT_ANSWER' 
                    ? studentAns.trim().toLowerCase() === q.correctAnswer?.trim().toLowerCase()
                    : studentAns === q.correctAnswer
                );

                return (
                  <div key={q.id} className="p-4 rounded-xl border border-border bg-card space-y-3">
                    <div className="flex items-center justify-between border-b border-border/60 pb-2">
                      <span className="font-bold text-xs text-foreground">
                        Questão {idx + 1} ({q.points.toFixed(1)} valores)
                      </span>
                      {isObjective ? (
                        isCorrect ? (
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-bold">
                            <Icon name="CircleCheck" className="w-4 h-4" />
                            Correcta (+{q.points.toFixed(1)} val)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-rose-600 font-bold">
                            <Icon name="CircleAlert" className="w-4 h-4" />
                            Errada (0 val)
                          </span>
                        )
                      ) : (
                        <span className="text-xs font-bold text-amber-600">
                          Dissertativa (Correcção Manual)
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-foreground font-medium">{q.prompt}</p>

                    <div className="p-2.5 rounded-lg bg-muted/40 text-xs">
                      <span className="text-muted-foreground block text-[11px] mb-0.5">Resposta do Aluno:</span>
                      <p className="font-mono text-foreground font-semibold">
                        {studentAns || <span className="italic text-muted-foreground">Sem resposta</span>}
                      </p>
                    </div>

                    {/* Bloco de Correcção para Dissertativas */}
                    {q.type === 'ESSAY' && (
                      <div className="pt-2 border-t border-border/40 space-y-3 bg-amber-50/50 p-3 rounded-lg border border-amber-200">
                        <p className="text-[11px] text-muted-foreground italic">
                          Critérios: {q.rubricCriteria}
                        </p>
                        <div className="flex flex-wrap items-center gap-3">
                          <div className="w-40">
                            <label className="block text-[11px] font-semibold text-foreground mb-1">
                              Nota Atribuída (0 a {q.points.toFixed(1)})
                            </label>
                            <input
                              type="number"
                              step="0.5"
                              min="0"
                              max={q.points}
                              value={essayScoreInputs[q.id] !== undefined ? essayScoreInputs[q.id] : (activeSubmission.essayScores[q.id] || 0)}
                              onChange={(e) => setEssayScoreInputs({ ...essayScoreInputs, [q.id]: Number(e.target.value) })}
                              className="w-full px-2 py-1 text-xs rounded border border-border bg-background font-mono"
                            />
                          </div>

                          <div className="flex-1">
                            <label className="block text-[11px] font-semibold text-foreground mb-1">
                              Feedback ao Aluno
                            </label>
                            <input
                              type="text"
                              placeholder="Observações do professor..."
                              value={essayFeedbackInputs[q.id] !== undefined ? essayFeedbackInputs[q.id] : (activeSubmission.essayFeedback[q.id] || '')}
                              onChange={(e) => setEssayFeedbackInputs({ ...essayFeedbackInputs, [q.id]: e.target.value })}
                              className="w-full px-2 py-1 text-xs rounded border border-border bg-background"
                            />
                          </div>

                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleSaveEssayGrade(q.id, q.points)}
                            className="h-7 text-xs mt-4"
                          >
                            Gravar Nota
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Rodapé com Lançamento na Mini-Pauta (UC-02) */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              {activeSubmission.isPushedToGradebook ? (
                <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
                  <Icon name="CheckCheck" className="w-4 h-4 text-emerald-600" />
                  Nota Lançada na Mini-Pauta Oficial (Decreto 424/25)
                </span>
              ) : (
                <Button
                  variant="default"
                  size="sm"
                  onClick={handlePushToPauta}
                  className="bg-primary text-white gap-1.5 text-xs font-semibold"
                >
                  <Icon name="FileCheck" className="w-4 h-4" />
                  Lançar Nota na Mini-Pauta da Turma (UC-02)
                </Button>
              )}

              <Button variant="outline" size="sm" onClick={() => setIsGradingModalOpen(false)}>
                Fechar Mesa
              </Button>
            </div>
          </div>
        )}
      </GlobalModal>
    </div>
  );
}
