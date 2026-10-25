/**
 * Glossário único do sistema: cada termo tem uma só definição, usada por `HelpHint` em todos os ecrãs.
 * Só entram termos cuja regra foi confirmada na API; valores que a escola define (pesos, notas mínimas) não se fixam aqui.
 */
export interface GlossaryEntry {
  title: string;
  text: string;
}

export const GLOSSARY = {
  mac: { title: "MAC — Média das Avaliações Contínuas", text: "Média ponderada das avaliações contínuas do período. Recalcula-se a cada nota lançada." },
  mas: { title: "MAS — Média das Avaliações Sistemáticas", text: "Média ponderada das avaliações sistemáticas do período." },
  pp: { title: "PP — Prova Periódica", text: "A prova do período. A MT só existe quando a prova periódica está lançada." },
  mt: { title: "MT — Média Trimestral", text: "Média ponderada de MAC, MAS e PP segundo os pesos e o arredondamento definidos nas Políticas da Escola." },
  mfd: { title: "MFD — Média Final da Disciplina", text: "Média das MT dos períodos, arredondada segundo a política da escola. É a nota que decide a transição de classe." },
  npp: { title: "NPP — Nota da Prova do Professor", text: "Nota da prova aplicada pelo professor no período (avaliação sistemática)." },
  npt: { title: "NPT — Nota da Prova Trimestral", text: "Nota da prova trimestral (prova periódica)." },
  ausente: { title: "Ausente", text: "Faltou à avaliação. Conta como 0 ou sai da média, conforme a política da escola («Tratamento de falta a avaliação»)." },
  dispensado: { title: "Dispensado / Não avaliado", text: "A avaliação não conta para este aluno: sai da média e dos pesos e não fica como nota pendente." },
  pauta: { title: "Pauta", text: "Quadro das notas de uma turma num período. Quando a Direção a fecha, guarda-se uma versão imutável (snapshot) e as notas ficam bloqueadas." },
  snapshot: { title: "Snapshot", text: "Cópia imutável da pauta no momento do fecho. É a que sai nos PDF e nos boletins; reabrir não a apaga." },
  proposta_transicao: { title: "Proposta de transição", text: "Resultado calculado pelo sistema (transita, transita com apoio, não transita). A decisão final é do Conselho de Turma final e fica registada com justificação se divergir." },
  transita_com_apoio: { title: "Transita com apoio", text: "Regime de exceção da política da escola: até ao máximo de disciplinas negativas definido, com notas no intervalo definido e nenhuma delas nuclear (Língua Portuguesa ou Matemática)." },
  chamada: { title: "Chamada de exame", text: "Época de exame: 1.ª, 2.ª, recurso ou melhoria. Cada uma tem regras de admissão próprias." },
  comprovativo: { title: "Comprovativo de pagamento", text: "Documento interno que prova que o pagamento foi registado na escola. Não tem valor fiscal: o documento fiscal é a fatura-recibo emitida no MindGest ao marcar como pago." },
  factura_certificada: { title: "Fatura-recibo certificada", text: "Documento fiscal emitido no MindGest quando uma ou mais cobranças são marcadas como pagas (uma por acto de pagamento). Só depois de certificada tem número fiscal. Estornos e notas de crédito fazem-se só no MindGest." },
  cobranca: { title: "Cobrança, pagamento e fatura", text: "Cobrança é o que a família deve (propina, matrícula, multa). Pagamento é o dinheiro recebido, registado ao «Marcar como pago» (valor total, sem pagamento parcial). Fatura é a fatura-recibo, o documento fiscal, emitida no MindGest por cada acto de pagamento." },
  nif: { title: "NIF do cliente", text: "Número de identificação fiscal de quem paga. A fatura-recibo sai em nome do encarregado com NIF; sem NIF, do aluno; sem NIF de ninguém, como «consumidor final». «Verificar NIF» consulta o contribuinte." },
  multa: { title: "Multa de mora", text: "Fatura própria, ligada à fatura em atraso, criada depois do prazo de tolerância. Se a política tiver agravamento mensal, nasce uma nova a cada mês completo em dívida." },
  tolerancia: { title: "Tolerância", text: "Dias depois do vencimento em que ainda não se cobra multa." },
  referencia_pagamento: { title: "Referência de pagamento", text: "Código «MS…» da fatura, que o encarregado indica ao pagar." },
  numero_processo: { title: "N.º de processo", text: "Número do aluno na escola. É diferente do n.º de matrícula, que identifica cada matrícula (uma por ano letivo)." },
  numero_documento: { title: "N.º do documento oficial", text: "Número sequencial único por escola, tipo e ano. Não se reutiliza nem se edita; eliminar o documento deixa um buraco na série e o QR deixa de validar." },
  instantaneo_med: { title: "Instantâneo (mapas MED)", text: "Corte imutável dos dados da escola numa data, com um código de verificação (checksum). Cada mapa parte de um instantâneo." },
  quota: { title: "Quotas do plano", text: "Limites do plano contratado (alunos, utilizadores, exportações por mês, armazenamento). Aos 80% há aviso; aos 100% a ação é recusada." },
} satisfies Record<string, GlossaryEntry>;

export type GlossaryKey = keyof typeof GLOSSARY;
