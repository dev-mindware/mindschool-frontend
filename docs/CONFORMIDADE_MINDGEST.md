# Relatório de conformidade com as regras do MindGest (frontend)

Referência: `mindgest-frontend` + skill `mindgest-frontend-sdk`. Estado: `tsc --noEmit` limpo.

## 1. Constatações (antes) e correcção

| Regra MindGest | Constatação inicial | Estado |
|---|---|---|
| Simulador de RBAC fora da UI | Presente na dashboard e na sidebar | Corrigido: componentes e store removidos; o papel vem sempre da sessão |
| Settings = abas de `/settings` | Segurança, utilizadores, políticas, importações, auditoria, professores e calendário em páginas próprias | Corrigido: `DefSetup` com abas `?tab=` (aparência, segurança, notificações, subscrição, guias; escola: institucional, políticas, utilizadores, professores, importações, auditoria). Rotas antigas redireccionam; menu "Administração" removido |
| Forms em modais (`GlobalModal`/`useModal`) | Muitos forms inline ou em páginas | Corrigido nos módulos migrados via `FormModal` + `ConfirmModal` (sem `window.prompt/confirm`) |
| Tabelas via componente partilhado, sem tabela dentro de card | `<table>` crus e tabelas em cards | Corrigido nos módulos migrados via `DataList` (sobre `GenericTable`) |
| Filtros: `FilterPopover` + estado na URL (nuqs) | Filtros em estado local, barras em caixa, poucos filtros | Corrigido via `useListFilters`/`DataList`: pesquisa, filtros múltiplos, intervalo de datas, ordenação, paginação, contador de filtros activos, tudo na URL |
| Calendário / horário com vista de calendário | Apenas listas | Corrigido: `MonthCalendar` (calendário académico, com alternância para lista) e `WeekTimetable` (horário por turma/professor) |
| Dashboard = PageWrapper + TitleList + período + métricas/gráficos | Dashboards por papel com dados gerados | Corrigido: dashboard única, dados reais por papel (relatórios da API), `DynamicMetricCard`, gráficos e secções |
| Página de planos (3 cards, "Mais Popular", lista de features, "Todos os planos incluem") | UI fora do padrão | Corrigido: catálogo vindo da API + add-ons + gestão da subscrição (aba em settings) |
| Páginas finas, sem axios na UI, services→hooks→components | Maioritariamente cumprido | Mantido |

## 2. Kit criado (reutilizável)
`useListFilters`, `DataList`, `FormModal`, `FormSelect/Textarea/Combobox`, `ConfirmModal`, `MonthCalendar`, `WeekTimetable`.

## 3. Módulos migrados (DataList + FormModal/ConfirmModal, filtros na URL)
Alunos, encarregados, matrículas, turmas, disciplinas, atribuições docentes, candidaturas, provas de acesso, propinas (pagamentos, cobranças, balancete com gráfico, política), certificados e declarações, risco de abandono, transições, pautas (+ livro de auditoria), assiduidade docente, provas online, mapas MED (instantâneos), catálogo de relatórios (pré-visualização em modal), painel multi-escola, painel da plataforma, portal da família (notas, reapreciação, propinas, provas, horário semanal, assiduidade, documentos, calendário mensal, requerimentos), comunicados, biblioteca, revisões/conselhos/exames finais, sessões de admissão, boletins, aulas, assiduidade, saúde, transporte, extracurriculares, calendário, horários, secretaria, dashboard, settings, planos/subscrição.

## 4. Dados simulados e acções falsas encontrados (corrigidos)
- Comunicados/circulares: estavam em `localStorage` (store zustand) com RSVP simulado. Agora usam a API `announcements` (rascunho → publicado → arquivado; chegam ao portal). O RSVP foi retirado porque a API não o suporta.
- Cobranças: "74% taxa de recuperação" e "98,2% entrega WhatsApp" eram constantes; substituídos por indicadores calculados (contactáveis, vencidas).
- Provas de acesso: "74,2% aprovação" constante; agora calculada com as notas lançadas.
- Balancete financeiro: "exportado com sucesso" sem exportar; agora gera um CSV real.
- Matrículas: "Comprovativo (PDF)" era um `alert()`; agora emite a declaração de frequência pela API e abre o PDF.
- Política de propinas: o formulário gravava campos que a API ignora (nome, ciclo, irmãos…) e o botão "eliminar" não fazia nada; agora só edita a política real (propina, matrícula, multa, tolerância).
- SAF-T: o botão simulava uma geração; agora informa que ainda não está disponível.

## 5. Lacunas / desvios conscientes
- `grade-entry-table` (lançamento de notas) mantém uma grelha tipo folha de cálculo com campos por célula: é uma grelha de introdução de dados, não uma listagem.
- `consolidated-pauta-modal`, `med-map-preview-modal` e `audit-diff-table`: tabelas dentro de modais de pré-visualização/impressão (layout oficial).
- `item-list` (itens da factura) vem do próprio MindGest e foi mantido.
- Checkboxes e ficheiros nativos em utilizadores/subscrição/construtor de questões.
- Código órfão (sem rota) com dados simulados, a remover: `components/client/reports/academic/*`, `stores/school/academic-performance-store.ts`, `types/academic-performance.ts`, `components/client/reports/med/reports-med-*` e `stores/school/reports-med-store.ts`. A remoção em lote foi bloqueada pela política de segurança desta sessão; deve ser feita manualmente.
- Quadro de Honra por aluno: não existe relatório na API; só faria sentido depois de criar `avaliacao.quadro_honra`.
- Controlo de acessos (`access-control-content`) e listas de documentos MindGest (nota de crédito, proforma, factura-recibo) seguem o padrão MindGest original (paginação no servidor); não foram alterados.

## 6. Actualização (modais, propinas e emails)
- `GlobalModal` passou ao padrão do nora-audiovisual-frontend: cabeçalho fixo, **só o conteúdo tem scroll** e o `footer` (botões à direita, em largura total no telemóvel) fica sempre visível. `FormModal` e `ConfirmModal` usam-no (botão de submissão ligado ao formulário via `form={id}`).
- Selecção de aluno em modais: `StudentSelect` (sobre o `PaginatedSelect` do MindGest, com pesquisa e paginação).
- Propinas: visão geral financeira, fila de comprovativos com revisão, dados bancários (definições), pagamento no portal e painel financeiro da família; relatório financeiro no padrão de dashboard MindGest.
- Emails: aba "Emails enviados" nas definições e centro de emails na plataforma.
