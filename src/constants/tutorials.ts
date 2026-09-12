export const YOUTUBE_CHANNEL_URL = "https://www.youtube.com/@mindware-y25";

export type TutorialCategory = "todos" | "geral" | "academica" | "matriculas" | "financas" | "secretaria";

export interface TutorialVideo {
  id: string;
  title: string;
  description: string;
  category: TutorialCategory;
  youtubeId: string;
  duration?: string;
}

export const TUTORIAL_CATEGORIES: { id: TutorialCategory; label: string }[] = [
  { id: "todos", label: "Todos os Tutoriais" },
  { id: "geral", label: "Visão Geral & Escola" },
  { id: "matriculas", label: "Alunos & Matrículas" },
  { id: "academica", label: "Pautas & Avaliações" },
  { id: "financas", label: "Propinas & Pagamentos" },
  { id: "secretaria", label: "Secretaria & Documentos" },
];

export const TUTORIAL_VIDEOS: TutorialVideo[] = [
  {
    id: "1",
    title: "1 — Configuração Inicial da Instituição Escolar",
    description: "Aprenda a registar dados institucionais, ciclos de ensino e parâmetros do ano lectivo no MindSchool.",
    category: "geral",
    youtubeId: "OM3l6od4pNA",
    duration: "3:34",
  },
  {
    id: "2",
    title: "2 — Gestão de Alunos, Encarregados e Matrículas",
    description: "Como cadastrar novos estudantes, atribuir turmas e gerir o processo de confirmação de matrícula.",
    category: "matriculas",
    youtubeId: "cTS5sORqMHs",
    duration: "3:33",
  },
  {
    id: "3",
    title: "3 — Lançamento de Notas e Mini-Pautas Trimestrais",
    description: "Guia completo de introdução de notas contínuas (MAC, NPP, NPT) e cálculo automático segundo o Decreto 424/25.",
    category: "academica",
    youtubeId: "cZWHJ9UzVqg",
    duration: "6:40",
  },
  {
    id: "4",
    title: "4 — Cobrança de Propinas, Emolumentos e Recibos",
    description: "Gestão de planos de pagamento, liquidação de mensalidades de propinas e emissão de recibos escolares.",
    category: "financas",
    youtubeId: "J0ZNxEwQTGc",
    duration: "4:38",
  },
  {
    id: "5",
    title: "5 — Secretaria Digital, Declarações e Protocolos",
    description: "Tramitação de pedidos de certificados com notas, emissão de guias de transferência e comprovativos de entrega.",
    category: "secretaria",
    youtubeId: "CT5jy-2g8Dg",
    duration: "4:51",
  },
  {
    id: "6",
    title: "6 — Mapas Oficiais para o MED e Relatórios Estatísticos",
    description: "Como exportar os mapas estatísticos I, II e III do Ministério da Educação e ficheiros SAF-T de propinas.",
    category: "geral",
    youtubeId: "Csw8bLSWPO0",
    duration: "8:42",
  },
  {
    id: "7",
    title: "7 — Assistente Inteligente MIND AI na Gestão Pedagógica",
    description: "Descubra como utilizar a inteligência artificial para detectar risco de abandono escolar e gerar relatórios.",
    category: "academica",
    youtubeId: "7vC-tyr3uS0",
    duration: "7:43",
  },
];
