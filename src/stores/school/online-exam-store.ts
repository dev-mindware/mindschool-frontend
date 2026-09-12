import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  OnlineExam, 
  StudentExamSubmission, 
  ExamQuestion, 
  ExamStatus, 
  ExamMetrics 
} from '@/types/online-exam';

interface OnlineExamState {
  exams: OnlineExam[];
  submissions: StudentExamSubmission[];
  selectedExamId: string | null;
  searchQuery: string;
  filterStatus: ExamStatus | 'ALL';
  filterSubject: string;

  // Actions
  selectExam: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setStatusFilter: (status: ExamStatus | 'ALL') => void;
  setSubjectFilter: (subject: string) => void;

  createExam: (examData: Omit<OnlineExam, 'id' | 'createdAt' | 'questions'>) => OnlineExam;
  addQuestion: (examId: string, question: Omit<ExamQuestion, 'id'>) => void;
  updateExamStatus: (examId: string, status: ExamStatus) => void;
  
  submitStudentExam: (examId: string, studentId: string, answers: Record<string, string>) => StudentExamSubmission;
  gradeEssayQuestion: (submissionId: string, questionId: string, score: number, feedback?: string) => void;
  pushScoreToGradebook: (submissionId: string) => void;
  getMetrics: () => ExamMetrics;
}

const initialExams: OnlineExam[] = [
  {
    id: 'exam-001',
    title: '1.ª Prova Parcial de Matemática (Geometria & Álgebra)',
    subjectId: 'sub-mat-8',
    subjectName: 'Matemática',
    classId: 'sec-8a',
    className: '8ª Classe A (Manhã)',
    term: 1,
    academicYear: '2025/2026',
    durationMinutes: 60,
    totalPoints: 20.0,
    passingPoints: 10.0,
    status: 'PUBLISHED',
    startDate: '2026-09-10 08:00',
    endDate: '2026-09-15 18:00',
    createdByTeacherId: 'tch-01',
    createdByTeacherName: 'Prof. Mateus Kapuka',
    createdAt: '2026-09-01',
    questions: [
      {
        id: 'q-01',
        type: 'MULTIPLE_CHOICE',
        prompt: 'Qual é o valor da hipotenusa de um triângulo rectângulo cujos catetos medem 6 cm e 8 cm?',
        points: 5.0,
        options: [
          { id: 'opt-a', label: 'A', text: '14 cm' },
          { id: 'opt-b', label: 'B', text: '10 cm' },
          { id: 'opt-c', label: 'C', text: '12 cm' },
          { id: 'opt-d', label: 'D', text: '8 cm' },
        ],
        correctAnswer: 'opt-b',
      },
      {
        id: 'q-02',
        type: 'TRUE_FALSE',
        prompt: 'Em qualquer triângulo equilátero, todos os ângulos internos medem exactamente 60 graus.',
        points: 4.0,
        correctAnswer: 'TRUE',
      },
      {
        id: 'q-03',
        type: 'SHORT_ANSWER',
        prompt: 'Qual é a solução da equação do 1.º grau: 2x + 10 = 24 ? (Indique apenas o valor numérico de x)',
        points: 5.0,
        correctAnswer: '7',
      },
      {
        id: 'q-04',
        type: 'ESSAY',
        prompt: 'Explique detalhadamente como o Teorema de Pitágoras pode ser aplicado para calcular a diagonal de um terreno quadrangular em Luanda com lados de 20 metros.',
        points: 6.0,
        rubricCriteria: 'Clareza na formulação da equação (2.0 val), cálculo dos quadrados (2.0 val) e interpretação prática da medida (2.0 val).',
      },
    ],
  },
  {
    id: 'exam-002',
    title: 'Ficha de Avaliação Trimestral de Língua Portuguesa',
    subjectId: 'sub-pt-7',
    subjectName: 'Língua Portuguesa',
    classId: 'sec-7a',
    className: '7ª Classe A (Manhã)',
    term: 1,
    academicYear: '2025/2026',
    durationMinutes: 45,
    totalPoints: 20.0,
    passingPoints: 10.0,
    status: 'GRADED',
    startDate: '2026-09-02 08:00',
    endDate: '2026-09-04 18:00',
    createdByTeacherId: 'tch-02',
    createdByTeacherName: 'Prof.ª Teresa Gonçalves',
    createdAt: '2026-08-28',
    questions: [
      {
        id: 'q-pt-01',
        type: 'MULTIPLE_CHOICE',
        prompt: 'Identifique a frase que contém uma oração subordinada adverbial temporal:',
        points: 6.0,
        options: [
          { id: 'opt-1', label: 'A', text: 'Ele estuda porque quer ser médico.' },
          { id: 'opt-2', label: 'B', text: 'Logo que o professor entrou, a turma fez silêncio.' },
          { id: 'opt-3', label: 'C', text: 'Se fizer sol, iremos à praia de Cacuaco.' },
          { id: 'opt-4', label: 'D', text: 'Embora estivesse calor, vestiu o casaco.' },
        ],
        correctAnswer: 'opt-2',
      },
      {
        id: 'q-pt-02',
        type: 'TRUE_FALSE',
        prompt: 'A palavra "paralelepípedo" é classificada gramaticalmente como esdrúxula (proparoxítona).',
        points: 4.0,
        correctAnswer: 'TRUE',
      },
      {
        id: 'q-pt-03',
        type: 'ESSAY',
        prompt: 'Escreva um pequeno texto de 5 a 8 linhas sobre a importância da preservação do Rio Kwanza para as comunidades angolanas.',
        points: 10.0,
        rubricCriteria: 'Coerência textual (4.0 val), correcção ortográfica (3.0 val) e riqueza vocabular (3.0 val).',
      },
    ],
  },
  {
    id: 'exam-003',
    title: 'Teste Diagnóstico de Física - Cinemática',
    subjectId: 'sub-fis-10',
    subjectName: 'Física',
    classId: 'sec-10a',
    className: '10ª Classe - CFB',
    term: 1,
    academicYear: '2025/2026',
    durationMinutes: 50,
    totalPoints: 20.0,
    passingPoints: 10.0,
    status: 'IN_PROGRESS',
    startDate: '2026-09-11 07:00',
    endDate: '2026-09-12 18:00',
    createdByTeacherId: 'tch-01',
    createdByTeacherName: 'Prof. Mateus Kapuka',
    createdAt: '2026-09-08',
    questions: [
      {
        id: 'q-fis-01',
        type: 'MULTIPLE_CHOICE',
        prompt: 'Um candongueiro percorre uma distância de 60 km em Luanda no tempo de 1,5 horas. Qual é a sua velocidade média em km/h?',
        points: 7.0,
        options: [
          { id: 'f-1', label: 'A', text: '35 km/h' },
          { id: 'f-2', label: 'B', text: '40 km/h' },
          { id: 'f-3', label: 'C', text: '50 km/h' },
          { id: 'f-4', label: 'D', text: '45 km/h' },
        ],
        correctAnswer: 'f-2',
      },
      {
        id: 'q-fis-02',
        type: 'SHORT_ANSWER',
        prompt: 'No Sistema Internacional de Unidades (SI), qual é a unidade fundamental de tempo? (Escreva a palavra por extenso)',
        points: 5.0,
        correctAnswer: 'segundo',
      },
      {
        id: 'q-fis-03',
        type: 'ESSAY',
        prompt: 'Diferencie Velocidade Instantânea de Velocidade Média, apresentando um exemplo prático do trânsito na Avenida Deolinda Rodrigues.',
        points: 8.0,
        rubricCriteria: 'Definição correcta (4.0 val) e exemplo prático contextualizado (4.0 val).',
      },
    ],
  },
];

const initialSubmissions: StudentExamSubmission[] = [
  {
    id: 'sub-001',
    examId: 'exam-001',
    studentId: 'std-luanda-001',
    studentName: 'Ana Clara Cassule dos Santos',
    studentNumber: 'MS-2026/001',
    startedAt: '2026-09-11 08:15',
    submittedAt: '2026-09-11 09:05',
    answers: {
      'q-01': 'opt-b',
      'q-02': 'TRUE',
      'q-03': '7',
      'q-04': 'Aplicando o Teorema de Pitágoras num terreno de 20m de lado, temos diagonal d² = 20² + 20² = 400 + 400 = 800. A raiz de 800 é aproximadamente 28,28 metros de diagonal.',
    },
    essayScores: {
      'q-04': 5.5,
    },
    essayFeedback: {
      'q-04': 'Excelente raciocínio e aplicação dos cálculos matemáticos.',
    },
    objectiveScore: 14.0, // 5 + 4 + 5
    essayScore: 5.5,
    totalScore: 19.5,
    status: 'GRADED',
    isPushedToGradebook: true,
    pushedAt: '2026-09-11 11:30',
  },
  {
    id: 'sub-002',
    examId: 'exam-001',
    studentId: 'std-luanda-002',
    studentName: 'Manuel Domingos Baptista',
    studentNumber: 'MS-2026/014',
    startedAt: '2026-09-11 08:30',
    submittedAt: '2026-09-11 09:20',
    answers: {
      'q-01': 'opt-b',
      'q-02': 'TRUE',
      'q-03': '12', // errado
      'q-04': 'Usamos a fórmula d = raiz de 20 + 20 para encontrar o comprimento total do terreno.',
    },
    essayScores: {},
    essayFeedback: {},
    objectiveScore: 9.0, // 5 + 4 + 0
    essayScore: 0.0,
    totalScore: 9.0,
    status: 'SUBMITTED', // Aguarda correcção da dissertativa
    isPushedToGradebook: false,
  },
  {
    id: 'sub-003',
    examId: 'exam-002',
    studentId: 'std-luanda-003',
    studentName: 'Graça Victória Nzuzi',
    studentNumber: 'MS-2026/032',
    startedAt: '2026-09-03 10:00',
    submittedAt: '2026-09-03 10:40',
    answers: {
      'q-pt-01': 'opt-2',
      'q-pt-02': 'TRUE',
      'q-pt-03': 'O Rio Kwanza é o maior rio inteiramente angolano e fornece água vital para as populações e hidroelétricas de Cambambe e Capanda.',
    },
    essayScores: {
      'q-pt-03': 8.5,
    },
    essayFeedback: {
      'q-pt-03': 'Boa contextualização do rio Kwanza.',
    },
    objectiveScore: 10.0, // 6 + 4
    essayScore: 8.5,
    totalScore: 18.5,
    status: 'GRADED',
    isPushedToGradebook: true,
    pushedAt: '2026-09-04 14:00',
  },
];

export const useOnlineExamStore = create<OnlineExamState>()(
  persist(
    (set, get) => ({
      exams: initialExams,
      submissions: initialSubmissions,
      selectedExamId: null,
      searchQuery: '',
      filterStatus: 'ALL',
      filterSubject: 'ALL',

      selectExam: (id) => set({ selectedExamId: id }),

      setSearchQuery: (query) => set({ searchQuery: query }),

      setStatusFilter: (status) => set({ filterStatus: status }),

      setSubjectFilter: (subject) => set({ filterSubject: subject }),

      createExam: (data) => {
        const newExam: OnlineExam = {
          ...data,
          id: `exam-${Date.now()}`,
          questions: [],
          createdAt: new Date().toISOString().slice(0, 10),
        };

        set((state) => ({
          exams: [newExam, ...state.exams],
        }));

        return newExam;
      },

      addQuestion: (examId, questionData) => {
        set((state) => ({
          exams: state.exams.map((exam) => {
            if (exam.id !== examId) return exam;

            const newQ: ExamQuestion = {
              ...questionData,
              id: `q-${Date.now()}`,
            };

            const updatedQuestions = [...exam.questions, newQ];
            const updatedTotalPoints = updatedQuestions.reduce((sum, q) => sum + q.points, 0);

            return {
              ...exam,
              questions: updatedQuestions,
              totalPoints: updatedTotalPoints,
            };
          }),
        }));
      },

      updateExamStatus: (examId, status) => {
        set((state) => ({
          exams: state.exams.map((e) => (e.id === examId ? { ...e, status } : e)),
        }));
      },

      submitStudentExam: (examId, studentId, answers) => {
        const { exams, submissions } = get();
        const exam = exams.find((e) => e.id === examId);
        if (!exam) throw new Error('Prova não encontrada.');

        // Correcção automática das questões objectivas
        let objectiveScore = 0;
        let hasEssay = false;

        exam.questions.forEach((q) => {
          const studentAns = answers[q.id];
          if (q.type === 'MULTIPLE_CHOICE' || q.type === 'TRUE_FALSE') {
            if (studentAns && studentAns.toLowerCase() === q.correctAnswer?.toLowerCase()) {
              objectiveScore += q.points;
            }
          } else if (q.type === 'SHORT_ANSWER') {
            if (studentAns && studentAns.trim().toLowerCase() === q.correctAnswer?.trim().toLowerCase()) {
              objectiveScore += q.points;
            }
          } else if (q.type === 'ESSAY') {
            hasEssay = true;
          }
        });

        const status = hasEssay ? 'SUBMITTED' : 'GRADED';
        const nowStr = `${new Date().toISOString().slice(0, 10)} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

        const newSubmission: StudentExamSubmission = {
          id: `sub-${Date.now()}`,
          examId,
          studentId,
          studentName: 'Aluno Simulado MindSchool',
          studentNumber: 'MS-2026/099',
          startedAt: nowStr,
          submittedAt: nowStr,
          answers,
          essayScores: {},
          essayFeedback: {},
          objectiveScore,
          essayScore: 0,
          totalScore: objectiveScore,
          status,
          isPushedToGradebook: false,
        };

        set({
          submissions: [newSubmission, ...submissions],
        });

        return newSubmission;
      },

      gradeEssayQuestion: (submissionId, questionId, score, feedback) => {
        set((state) => ({
          submissions: state.submissions.map((sub) => {
            if (sub.id !== submissionId) return sub;

            const updatedEssayScores = {
              ...sub.essayScores,
              [questionId]: score,
            };

            const updatedEssayFeedback = feedback
              ? { ...sub.essayFeedback, [questionId]: feedback }
              : sub.essayFeedback;

            const totalEssayScore = Object.values(updatedEssayScores).reduce((sum, val) => sum + val, 0);
            const totalScore = Math.min(20.0, sub.objectiveScore + totalEssayScore);

            return {
              ...sub,
              essayScores: updatedEssayScores,
              essayFeedback: updatedEssayFeedback,
              essayScore: totalEssayScore,
              totalScore,
              status: 'GRADED',
            };
          }),
        }));
      },

      pushScoreToGradebook: (submissionId) => {
        set((state) => ({
          submissions: state.submissions.map((sub) =>
            sub.id === submissionId
              ? {
                  ...sub,
                  isPushedToGradebook: true,
                  pushedAt: new Date().toISOString().slice(0, 10),
                }
              : sub
          ),
        }));
      },

      getMetrics: () => {
        const { exams, submissions } = get();
        const totalExams = exams.length;
        const activeExamsCount = exams.filter((e) => e.status === 'PUBLISHED' || e.status === 'IN_PROGRESS').length;
        const evaluatedStudentsCount = submissions.length;
        
        const gradedSubs = submissions.filter((s) => s.status === 'GRADED');
        const avgScore = gradedSubs.length > 0
          ? Number((gradedSubs.reduce((sum, s) => sum + s.totalScore, 0) / gradedSubs.length).toFixed(1))
          : 14.5;

        return {
          totalExams,
          activeExamsCount,
          evaluatedStudentsCount,
          autoGradingAccuracyPercentage: 98,
          averageScore: avgScore,
        };
      },
    }),
    {
      name: 'mindschool-online-exams-storage',
    }
  )
);
