export const YOUTUBE_CHANNEL_URL = "https://www.youtube.com/@mindware-y25";

export type TutorialCategory = "todos" | "geral" | "faturacao" | "stock" | "agt";

export interface TutorialVideo {
  id: string;
  title: string;
  description: string;
  category: TutorialCategory;
  youtubeId: string;
  duration?: string;
}

export const TUTORIAL_CATEGORIES: { id: TutorialCategory; label: string }[] = [
  { id: "todos", label: "Todos os Vídeos" },
  { id: "geral", label: "Visão Geral & Contas" },
  { id: "faturacao", label: "Faturação & MIND AI" },
  { id: "stock", label: "Produtos & Serviços" },
  { id: "agt", label: "Facturação AGT" },
];

export const TUTORIAL_VIDEOS: TutorialVideo[] = [
  {
    id: "1",
    title: "1 — Criação de Conta Colectiva ou Particular",
    description: "Aprenda a registar e configurar a sua empresa ou conta particular no Mindgest.",
    category: "geral",
    youtubeId: "OM3l6od4pNA",
    duration: "3:34",
  },
  {
    id: "2",
    title: "2 — Métricas do Painel Principal e Criação do Primeiro Cliente",
    description: "Como utilizar o painel principal (dashboard), entender indicadores de desempenho e cadastrar clientes.",
    category: "geral",
    youtubeId: "cTS5sORqMHs",
    duration: "3:33",
  },
  {
    id: "3",
    title: "3 — Criação de Itens do Tipo Produto e Serviço",
    description: "Guia completo para cadastrar produtos, serviços, preços, impostos e categorias no sistema.",
    category: "stock",
    youtubeId: "cZWHJ9UzVqg",
    duration: "6:40",
  },
  {
    id: "4",
    title: "4 — Funções do Plano Base, Relatórios de Venda e Visão Geral sobre MIND AI",
    description: "Explore os relatórios de venda, limites do plano base e a integração com o assistente inteligente MIND AI.",
    category: "faturacao",
    youtubeId: "J0ZNxEwQTGc",
    duration: "4:38",
  },
  {
    id: "5",
    title: "5 — Facturação Electrónica AGT: Como Aderir ao Portal e Obter as Chaves Passo a Passo",
    description: "Tutorial detalhado para aderir ao portal da AGT e gerar a sua chave de faturação eletrónica.",
    category: "agt",
    youtubeId: "CT5jy-2g8Dg",
    duration: "4:51",
  },
  {
    id: "6",
    title: "6 — Facturação Electrónica AGT: Inserir a Chave Privada no Mindgest e Criar Documentos",
    description: "Como inserir a chave privada no Mindgest e começar a emitir documentos fiscais certificados.",
    category: "agt",
    youtubeId: "Csw8bLSWPO0",
    duration: "8:42",
  },
  {
    id: "7",
    title: "Programa de Parceiros da Mindware para o Mindgest",
    description: "Descubra como se tornar parceiro da Mindware e obter rendimento recorrente.",
    category: "geral",
    youtubeId: "7vC-tyr3uS0",
    duration: "7:43",
  },
];
