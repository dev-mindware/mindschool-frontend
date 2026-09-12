import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  SchoolCircular,
  CircularType,
  AudienceType,
  RsvpStatus,
  CircularRsvpItem,
} from "@/types";

interface CircularState {
  circulars: SchoolCircular[];
  searchQuery: string;
  typeFilter: string;
  audienceFilter: string;

  // Actions
  setSearchQuery: (q: string) => void;
  setTypeFilter: (t: string) => void;
  setAudienceFilter: (a: string) => void;

  publishCircular: (
    data: Omit<SchoolCircular, "id" | "circularNumber" | "publishedAt" | "readCount">
  ) => SchoolCircular;

  updateRsvpStatus: (
    circularId: string,
    guardianId: string,
    status: RsvpStatus,
    notes?: string
  ) => void;

  incrementReadCount: (circularId: string) => void;
}

const DEFAULT_RSVP_LIST: CircularRsvpItem[] = [
  {
    guardianId: "grd-01",
    guardianName: "Eng. Sebastião Bento",
    guardianPhone: "+244 923 111 222",
    studentName: "Afonso Sebastião Bento",
    className: "9ª Classe A",
    status: "CONFIRMED",
    respondedAt: "2026-03-08 10:15",
  },
  {
    guardianId: "grd-02",
    guardianName: "Sr. Fernando Domingos",
    guardianPhone: "+244 945 888 111",
    studentName: "Ana Beatriz Domingos",
    className: "9ª Classe A",
    status: "CONFIRMED",
    respondedAt: "2026-03-08 11:30",
  },
  {
    guardianId: "grd-03",
    guardianName: "Sr. Daniel Kiala",
    guardianPhone: "+244 924 777 888",
    studentName: "Carlos Daniel Kiala",
    className: "9ª Classe A",
    status: "DECLINED",
    notes: "Estará em missão de serviço fora de Luanda nesta data.",
    respondedAt: "2026-03-08 14:00",
  },
  {
    guardianId: "grd-04",
    guardianName: "Sra. Teresa Manuel",
    guardianPhone: "+244 912 555 666",
    studentName: "Domingas Teresa Manuel",
    className: "9ª Classe A",
    status: "PENDING",
  },
  {
    guardianId: "grd-05",
    guardianName: "Sra. Teresa Van-Dúnem",
    guardianPhone: "+244 912 333 999",
    studentName: "Eduardo José Van-Dúnem",
    className: "9ª Classe A",
    status: "CONFIRMED",
    respondedAt: "2026-03-09 09:20",
  },
  {
    guardianId: "grd-08",
    guardianName: "Dra. Luísa Kapita",
    guardianPhone: "+244 931 444 555",
    studentName: "Helena Luísa Kapita",
    className: "9ª Classe A",
    status: "CONFIRMED",
    respondedAt: "2026-03-09 10:45",
  },
];

const INITIAL_CIRCULARS: SchoolCircular[] = [
  {
    id: "circ-14",
    circularNumber: "CIRC-2026/0014",
    title: "Convocatória para a Assembleia Geral de Pais e Encarregados de Educação",
    subtitle: "Apresentação do Rendimento Escolar do 1º Trimestre e Plano Estratégico",
    content: `A Direcção do Colégio tem a honra de convidar todos os Pais e Encarregados de Educação a participarem na Assembleia Geral do 2º Trimestre do Ano Lectivo 2025/2026.

A reunião terá como objectivos fundamentais a partilha dos resultados pedagógicos gerais, o reforço da disciplina escolar e a apresentação dos projectos pedagógicos extracurriculares.

A vossa presença é indispensável para o sucesso educacional dos nossos educandos.`,
    type: "MEETING_CONVOCATION",
    typeLabel: "Convocatória de Reunião de Pais",
    audience: "ALL_SCHOOL",
    audienceLabel: "Toda a Comunidade Escolar",
    publishedAt: "2026-03-07 10:00",
    eventDate: "2026-03-14",
    eventTime: "09:30",
    eventLocation: "Salão Nobre do Colégio (Auditório Principal)",
    agendaItems: [
      "1. Boas-vindas e Balanço do Rendimento Escolar do 1º Trimestre",
      "2. Apresentação das Normas de Assiduidade e Limite de Faltas do MED",
      "3. Calendário das Provas Trimestrais e Actividades Culturais",
      "4. Diversos e Esclarecimento de Dúvidas dos Encarregados",
    ],
    isUrgent: false,
    authorName: "Dr. Alberto Manuel Domingos",
    authorRole: "Director Geral do Colégio",
    totalRecipients: 420,
    readCount: 368,
    rsvpEnabled: true,
    rsvpList: DEFAULT_RSVP_LIST,
  },
  {
    id: "circ-13",
    circularNumber: "CIRC-2026/0013",
    title: "Calendário Geral das Provas do Professor e Avaliações do 2º Trimestre",
    subtitle: "Coordenação Pedagógica Central • Ensino Secundário Geral e Técnico",
    content: `A Direcção Pedagógica informa aos alunos e encarregados de educação o cronograma oficial de aplicação das Provas do Professor e das Provas Trimestrais.

Recomenda-se a pontualidade rigorosa e o cumprimento do horário lectivo. Não serão concedidas segundas chamadas excepto nos casos previstos por atestado médico homologado pela Direcção nos termos da legislação em vigor.`,
    type: "ACADEMIC_NOTICE",
    typeLabel: "Circular Pedagógica",
    audience: "SECOND_CYCLE",
    audienceLabel: "II Ciclo do Ensino Secundário",
    publishedAt: "2026-03-05 08:30",
    eventDate: "2026-03-23",
    eventTime: "08:00",
    eventLocation: "Salas de Aulas Regulamentares",
    isUrgent: false,
    authorName: "Profª. Maria Teresa Diogo da Silva",
    authorRole: "Directora Pedagógica",
    totalRecipients: 280,
    readCount: 245,
    rsvpEnabled: false,
  },
  {
    id: "circ-12",
    circularNumber: "CIRC-2026/0012",
    title: "Suspensão de Actividades Lectivas • Tolerância de Ponto Governamental",
    subtitle: "Cumprimento do Decreto Executivo Conjunto dos Ministérios da Administração Pública e Educação",
    content: `Em cumprimento do Decreto Executivo governamental relativo à tolerância de ponto, informamos que as actividades lectivas e de secretaria estarão suspensas na próxima sexta-feira.

As aulas serão retomadas com normalidade na segunda-feira seguinte às 07h30 para o turno da manhã e às 13h00 para o turno da tarde.`,
    type: "URGENT_ALERT",
    typeLabel: "Alerta Urgente da Direcção",
    audience: "ALL_SCHOOL",
    audienceLabel: "Toda a Comunidade Escolar",
    publishedAt: "2026-03-03 16:00",
    isUrgent: true,
    authorName: "Dr. Alberto Manuel Domingos",
    authorRole: "Director Geral",
    totalRecipients: 420,
    readCount: 412,
    rsvpEnabled: false,
  },
  {
    id: "circ-11",
    circularNumber: "CIRC-2026/0011",
    title: "Normas de Apresentação, Uso de Uniforme Escolar e Cartão de Acesso",
    subtitle: "Departamento de Disciplina Escolar e Apoio ao Aluno",
    content: `Relembra-se a todos os estudantes e respectivos encarregados que a entrada nas instalações escolares carece obrigatoriamente do uso do uniforme completo e da apresentação do Cartão Digital de Estudante nos torniquetes de acesso.

Estudantes sem calçado regulamentar ou com peças descaracterizadas serão orientados à Secretaria de Apoio ao Aluno.`,
    type: "ADMINISTRATIVE_NOTICE",
    typeLabel: "Aviso Administrativo",
    audience: "GUARDIANS_ONLY",
    audienceLabel: "Apenas Encarregados de Educação",
    publishedAt: "2026-03-01 11:15",
    isUrgent: false,
    authorName: "Eng. Pedro Sebastião Kiala",
    authorRole: "Director Administrativo",
    totalRecipients: 390,
    readCount: 350,
    rsvpEnabled: false,
  },
];

export const useCircularStore = create<CircularState>()(
  persist(
    (set, get) => ({
      circulars: INITIAL_CIRCULARS,
      searchQuery: "",
      typeFilter: "ALL",
      audienceFilter: "ALL",

      setSearchQuery: (searchQuery) => set({ searchQuery }),
      setTypeFilter: (typeFilter) => set({ typeFilter }),
      setAudienceFilter: (audienceFilter) => set({ audienceFilter }),

      publishCircular: (data) => {
        const currentYear = new Date().getFullYear();
        const nextNum = get().circulars.length + 15;
        const circularNumber = `CIRC-${currentYear}/${String(nextNum).padStart(4, "0")}`;
        const publishedAt = new Date().toISOString().slice(0, 16).replace("T", " ");

        const newCircular: SchoolCircular = {
          ...data,
          id: `circ-${Date.now()}`,
          circularNumber,
          publishedAt,
          readCount: 0,
          rsvpList: data.rsvpEnabled ? DEFAULT_RSVP_LIST : undefined,
        };

        set((state) => ({
          circulars: [newCircular, ...state.circulars],
        }));

        return newCircular;
      },

      updateRsvpStatus: (circularId, guardianId, status, notes) => {
        set((state) => ({
          circulars: state.circulars.map((c) => {
            if (c.id !== circularId || !c.rsvpList) return c;
            return {
              ...c,
              rsvpList: c.rsvpList.map((r) =>
                r.guardianId === guardianId
                  ? {
                      ...r,
                      status,
                      notes: notes !== undefined ? notes : r.notes,
                      respondedAt: new Date().toISOString().slice(0, 16).replace("T", " "),
                    }
                  : r
              ),
            };
          }),
        }));
      },

      incrementReadCount: (circularId) => {
        set((state) => ({
          circulars: state.circulars.map((c) =>
            c.id === circularId ? { ...c, readCount: c.readCount + 1 } : c
          ),
        }));
      },
    }),
    {
      name: "mindschool-circulars-storage",
    }
  )
);
