import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  StudentHealthProfile,
  ClinicVisitRecord,
  PsychopedagogicalPlan,
  ClinicVisitStatus,
  HealthUrgencyLevel,
  SpecialNeedType,
  BloodType,
} from "@/types";

interface HealthState {
  profiles: StudentHealthProfile[];
  visits: ClinicVisitRecord[];
  plans: PsychopedagogicalPlan[];
  searchQuery: string;
  selectedVisitStatus: string;
  selectedUrgency: string;

  // Actions
  setSearchQuery: (q: string) => void;
  setSelectedVisitStatus: (status: string) => void;
  setSelectedUrgency: (urgency: string) => void;

  saveHealthProfile: (profile: StudentHealthProfile) => void;
  getHealthProfileByStudentId: (studentId: string) => StudentHealthProfile | undefined;

  registerClinicVisit: (
    data: Omit<ClinicVisitRecord, "id" | "visitNumber" | "recordedAt">
  ) => ClinicVisitRecord;
  updateClinicVisitStatus: (
    id: string,
    status: ClinicVisitStatus,
    dischargeNotes?: string
  ) => void;

  addPsychopedagogicalPlan: (
    data: Omit<PsychopedagogicalPlan, "id" | "createdAt" | "updatedAt" | "sessions">
  ) => PsychopedagogicalPlan;
  updatePsychopedagogicalPlan: (
    id: string,
    data: Partial<PsychopedagogicalPlan>
  ) => void;
  addPsychologySession: (
    planId: string,
    session: {
      practitionerName: string;
      sessionType: "INDIVIDUAL" | "FAMILY_GUARDIAN" | "TEACHER_CONFERENCE";
      topicsDiscussed: string;
      observations: string;
      recommendations: string;
      nextSessionDate?: string;
    }
  ) => void;
}

const INITIAL_PROFILES: StudentHealthProfile[] = [
  {
    studentId: "stu-01",
    studentNumber: "MS-2026-0042",
    studentName: "Nzuzi Maria Afonso",
    classLevel: "10ª Classe",
    sectionName: "Turma 10A (Ciências Físicas e Biológicas)",
    bloodType: "O+",
    allergies: ["Amendoim e Frutos Secos (Severa)", "Picadas de Insectos"],
    chronicConditions: ["Asma Brônquica Moderada"],
    regularMedications: ["Salbutamol 100mcg Spray (em SOS)"],
    physicalRestrictions: ["Evitar corridas intensas em dias de elevada humidade ou poeira"],
    emergencyContactName: "Ana Paula Afonso (Mãe)",
    emergencyContactPhone: "+244 923 456 789",
    emergencyContactRelationship: "Mãe / Encarregada de Educação",
    healthInsuranceProvider: "ENSA Saúde Escolar",
    healthInsuranceNumber: "ENSA-98214-A",
    vaccinationUpToDate: true,
    confidentialNotes: "A aluna tem inalador na mochila escolar e autorização dos pais para uso imediato.",
    updatedAt: "2026-02-10",
  },
  {
    studentId: "stu-02",
    studentNumber: "MS-2026-0089",
    studentName: "Mauro António Gaspar",
    classLevel: "11ª Classe",
    sectionName: "Turma 11B (Ciências Económicas e Jurídicas)",
    bloodType: "A+",
    allergies: ["Penicilina / Amoxicilina (Choque Anafiláctico Prévio)"],
    chronicConditions: [],
    regularMedications: [],
    physicalRestrictions: [],
    emergencyContactName: "António Gaspar (Pai)",
    emergencyContactPhone: "+244 931 112 233",
    emergencyContactRelationship: "Pai",
    healthInsuranceProvider: "Nossa Seguros",
    healthInsuranceNumber: "NS-4412-K",
    vaccinationUpToDate: true,
    confidentialNotes: "Alergia medicamentosa severa. Nunca administrar antibióticos derivados da penicilina.",
    updatedAt: "2026-01-28",
  },
  {
    studentId: "stu-03",
    studentNumber: "MS-2026-0105",
    studentName: "Esperança Domingos",
    classLevel: "8ª Classe",
    sectionName: "Turma 8A (Ensino Geral)",
    bloodType: "B+",
    allergies: ["Lactose"],
    chronicConditions: ["Diabetes Tipo 1 (Insulino-dependente)"],
    regularMedications: ["Insulina Glargina matinal", "Insulina Rápida pré-refeições"],
    physicalRestrictions: ["Monitorizar glicemia antes da aula de Educação Física"],
    emergencyContactName: "Teresa Manuel Domingos",
    emergencyContactPhone: "+244 945 889 900",
    emergencyContactRelationship: "Tia / Tutora Legal",
    healthInsuranceProvider: "Fidelidade Angola",
    healthInsuranceNumber: "FID-6601",
    vaccinationUpToDate: true,
    confidentialNotes: "Kit com glicómetro e glucagon mantido na enfermaria escolar.",
    updatedAt: "2026-02-15",
  },
  {
    studentId: "stu-04",
    studentNumber: "MS-2026-0120",
    studentName: "Joaquim Bernardo Silva",
    classLevel: "7ª Classe",
    sectionName: "Turma 7C (Ensino Geral)",
    bloodType: "AB+",
    allergies: [],
    chronicConditions: [],
    regularMedications: [],
    physicalRestrictions: [],
    emergencyContactName: "Helena Silva",
    emergencyContactPhone: "+244 912 345 678",
    emergencyContactRelationship: "Mãe",
    vaccinationUpToDate: true,
    updatedAt: "2026-01-15",
  },
];

const INITIAL_VISITS: ClinicVisitRecord[] = [
  {
    id: "vis-01",
    visitNumber: "ENF-2026/0088",
    studentId: "stu-01",
    studentNumber: "MS-2026-0042",
    studentName: "Nzuzi Maria Afonso",
    classLevel: "10ª Classe",
    sectionName: "Turma 10A",
    recordedAt: "2026-03-04T10:15:00.000Z",
    recordedBy: "Enf. Graciete da Conceição",
    chiefComplaint: "Sensação de aperto torácico e tosse seca após aula de Ed. Física",
    symptoms: ["Dispneia ligeira", "Tosse espasmódica", "Saturação O2 94%"],
    urgencyLevel: "URGENT",
    vitalSigns: {
      temperatureCelsius: 36.6,
      bloodPressure: "105/65",
      heartRateBpm: 92,
    },
    actionsTaken: "Administrados 2 puffs de Salbutamol inalatório conforme protocolo. Repouso de 20 minutos em cadeira semi-inclinada.",
    administeredMedication: "Salbutamol 100mcg (autorizado na ficha)",
    status: "DISCHARGED_TO_CLASS",
    guardianNotified: true,
    guardianNotifiedAt: "2026-03-04T10:25:00.000Z",
    guardianNotes: "Mãe informada via chamada. Concordou com o regresso à sala após estabilização.",
    dischargeTime: "2026-03-04T10:45:00.000Z",
    dischargeNotes: "Saturação O2 subiu para 98%. Aluna assintomática e orientada para a aula teórica.",
  },
  {
    id: "vis-02",
    visitNumber: "ENF-2026/0089",
    studentId: "stu-04",
    studentNumber: "MS-2026-0120",
    studentName: "Joaquim Bernardo Silva",
    classLevel: "7ª Classe",
    sectionName: "Turma 7C",
    recordedAt: "2026-03-04T11:40:00.000Z",
    recordedBy: "Enf. Graciete da Conceição",
    chiefComplaint: "Pico febril repentino com calafrios e cefaleia durante o teste de História",
    symptoms: ["Febre 38.8ºC", "Cefaleia frontal", "Olhos congestos"],
    urgencyLevel: "MODERATE",
    vitalSigns: {
      temperatureCelsius: 38.8,
      bloodPressure: "100/60",
      heartRateBpm: 88,
    },
    actionsTaken: "Compressa tépida na fronte e hidratação oral. Contactado encarregado de educação para recolha do estudante.",
    administeredMedication: "Paracetamol 500mg (autorizado telefonicamente)",
    status: "SENT_HOME",
    guardianNotified: true,
    guardianNotifiedAt: "2026-03-04T11:50:00.000Z",
    guardianNotes: "Mãe a caminho para levar o aluno ao centro de saúde para despiste de malária.",
    dischargeTime: "2026-03-04T12:20:00.000Z",
    dischargeNotes: "Entregue à mãe na portaria da escola. Emitida guia de dispensa médica para as restantes aulas.",
  },
  {
    id: "vis-03",
    visitNumber: "ENF-2026/0090",
    studentId: "stu-03",
    studentNumber: "MS-2026-0105",
    studentName: "Esperança Domingos",
    classLevel: "8ª Classe",
    sectionName: "Turma 8A",
    recordedAt: "2026-03-04T13:30:00.000Z",
    recordedBy: "Enf. Graciete da Conceição",
    chiefComplaint: "Controlo preventivo de glicemia pós-almoço e tontura ligeira",
    symptoms: ["Glicemia capilar 72 mg/dL"],
    urgencyLevel: "ROUTINE",
    vitalSigns: {
      temperatureCelsius: 36.4,
      bloodPressure: "100/70",
      heartRateBpm: 76,
    },
    actionsTaken: "Fornecido sumo de maçã e bolacha simples. Glicemia reavaliada 15min depois para 110 mg/dL.",
    status: "DISCHARGED_TO_CLASS",
    guardianNotified: false,
    dischargeTime: "2026-03-04T13:55:00.000Z",
    dischargeNotes: "Nível glicémico normalizado. Aluna sentindo-se bem para a última aula.",
  },
];

const INITIAL_PLANS: PsychopedagogicalPlan[] = [
  {
    id: "plan-01",
    studentId: "stu-04",
    studentNumber: "MS-2026-0120",
    studentName: "Joaquim Bernardo Silva",
    classLevel: "7ª Classe",
    sectionName: "Turma 7C",
    specialNeedType: "ADHD",
    diagnosisSummary: "Défice de Atenção com Hiperactividade (TDAH) tipo combinado, com impacto na gestão de tempo durante avaliações sumativas.",
    pedagogicalCoordinator: "Prof. Alberto Kalandula",
    schoolPsychologist: "Dra. Isabel Vunge (Psicopedagoga)",
    startDate: "2026-01-20",
    reviewDate: "2026-06-30",
    isActive: true,
    curriculumAccommodations: [
      "Tempo adicional de 25% na realização de provas escritas",
      "Segmentação de tarefas longas em etapas sequenciais",
      "Leitura assistida dos enunciados complexos quando solicitada",
    ],
    classroomAdjustments: [
      "Carteira na fila central dianteira, distante de janelas e portas",
      "Pausas activas supervisionadas de 2 minutos entre blocos duplos de aulas",
      "Uso de agenda visual para anotação diária de TPC",
    ],
    sessions: [
      {
        id: "sess-01",
        date: "2026-02-05",
        practitionerName: "Dra. Isabel Vunge",
        sessionType: "INDIVIDUAL",
        topicsDiscussed: "Estratégias de autorregulação e organização do estojo e cadernos",
        observations: "Aluno motivado, receptivo ao uso de cores para destacar prioridades.",
        recommendations: "Orientar o delegado de turma para partilhar lembretes com o Joaquim.",
        nextSessionDate: "2026-02-19",
      },
      {
        id: "sess-02",
        date: "2026-02-19",
        practitionerName: "Dra. Isabel Vunge",
        sessionType: "TEACHER_CONFERENCE",
        topicsDiscussed: "Alinhamento com os docentes de Língua Portuguesa e Matemática sobre as acomodações",
        observations: "Professores confirmaram melhoria no foco durante as aulas matinais.",
        recommendations: "Manter o aluno na primeira carteira durante todo o 1º Trimestre.",
        nextSessionDate: "2026-03-12",
      },
    ],
    createdAt: "2026-01-20T08:00:00.000Z",
    updatedAt: "2026-02-19T14:30:00.000Z",
  },
  {
    id: "plan-02",
    studentId: "stu-03",
    studentNumber: "MS-2026-0105",
    studentName: "Esperança Domingos",
    classLevel: "8ª Classe",
    sectionName: "Turma 8A",
    specialNeedType: "LEARNING_DIFFICULTY",
    diagnosisSummary: "Dificuldade específica de leitura e descodificação ortográfica (Dislexia em monitorização).",
    pedagogicalCoordinator: "Prof. Alberto Kalandula",
    schoolPsychologist: "Dra. Isabel Vunge (Psicopedagoga)",
    startDate: "2026-02-01",
    reviewDate: "2026-07-15",
    isActive: true,
    curriculumAccommodations: [
      "Enunciados impressos com tipografia clara (fonte sem serifa, espaçamento 1.5)",
      "Privilegiar avaliação oral ou respostas objectivas sempre que aplicável",
      "Não penalizar erros ortográficos estritos em disciplinas não-linguísticas",
    ],
    classroomAdjustments: [
      "Evitar solicitação de leitura oral pública sem aviso prévio",
      "Disponibilização de material em suporte digital para síntese de voz",
    ],
    sessions: [
      {
        id: "sess-03",
        date: "2026-02-12",
        practitionerName: "Dra. Isabel Vunge",
        sessionType: "FAMILY_GUARDIAN",
        topicsDiscussed: "Rotina de estudo em casa e reforço positivo com a tutora legal",
        observations: "Encarregada muito colaborativa e disposta a acompanhar a leitura guiada.",
        recommendations: "Manter 20 minutos de leitura partilhada diária com materiais de interesse da aluna.",
        nextSessionDate: "2026-03-18",
      },
    ],
    createdAt: "2026-02-01T09:00:00.000Z",
    updatedAt: "2026-02-12T16:00:00.000Z",
  },
];

export const useHealthStore = create<HealthState>()(
  persist(
    (set, get) => ({
      profiles: INITIAL_PROFILES,
      visits: INITIAL_VISITS,
      plans: INITIAL_PLANS,
      searchQuery: "",
      selectedVisitStatus: "ALL",
      selectedUrgency: "ALL",

      setSearchQuery: (searchQuery) => set({ searchQuery }),
      setSelectedVisitStatus: (selectedVisitStatus) => set({ selectedVisitStatus }),
      setSelectedUrgency: (selectedUrgency) => set({ selectedUrgency }),

      saveHealthProfile: (profile) => {
        set((state) => {
          const index = state.profiles.findIndex((p) => p.studentId === profile.studentId);
          if (index >= 0) {
            const updated = [...state.profiles];
            updated[index] = { ...profile, updatedAt: new Date().toISOString().split("T")[0] };
            return { profiles: updated };
          }
          return {
            profiles: [
              ...state.profiles,
              { ...profile, updatedAt: new Date().toISOString().split("T")[0] },
            ],
          };
        });
      },

      getHealthProfileByStudentId: (studentId) => {
        return get().profiles.find((p) => p.studentId === studentId);
      },

      registerClinicVisit: (data) => {
        const year = new Date().getFullYear();
        const count = get().visits.length + 1;
        const visitNumber = `ENF-${year}/${String(count).padStart(4, "0")}`;

        const newVisit: ClinicVisitRecord = {
          ...data,
          id: `vis-${Date.now()}`,
          visitNumber,
          recordedAt: new Date().toISOString(),
        };

        set((state) => ({
          visits: [newVisit, ...state.visits],
        }));

        return newVisit;
      },

      updateClinicVisitStatus: (id, status, dischargeNotes) => {
        set((state) => ({
          visits: state.visits.map((v) => {
            if (v.id === id) {
              return {
                ...v,
                status,
                dischargeNotes: dischargeNotes || v.dischargeNotes,
                dischargeTime:
                  status === "DISCHARGED_TO_CLASS" ||
                  status === "SENT_HOME" ||
                  status === "REFERRED_TO_HOSPITAL"
                    ? new Date().toISOString()
                    : v.dischargeTime,
              };
            }
            return v;
          }),
        }));
      },

      addPsychopedagogicalPlan: (data) => {
        const newPlan: PsychopedagogicalPlan = {
          ...data,
          id: `plan-${Date.now()}`,
          sessions: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          plans: [newPlan, ...state.plans],
        }));

        return newPlan;
      },

      updatePsychopedagogicalPlan: (id, data) => {
        set((state) => ({
          plans: state.plans.map((p) => {
            if (p.id === id) {
              return {
                ...p,
                ...data,
                updatedAt: new Date().toISOString(),
              };
            }
            return p;
          }),
        }));
      },

      addPsychologySession: (planId, sessionData) => {
        const newSession = {
          ...sessionData,
          id: `sess-${Date.now()}`,
          date: new Date().toISOString().split("T")[0],
        };

        set((state) => ({
          plans: state.plans.map((p) => {
            if (p.id === planId) {
              return {
                ...p,
                sessions: [newSession, ...p.sessions],
                updatedAt: new Date().toISOString(),
              };
            }
            return p;
          }),
        }));
      },
    }),
    {
      name: "mindschool-health-storage",
    }
  )
);
