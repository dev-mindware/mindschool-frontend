# Integração do frontend com a API MindEscola

O frontend (clonado do padrão `mindgest-frontend`) tinha dados simulados em stores Zustand. A integração segue o padrão do MindGest:
**`services/<modulo>-service.ts` → `hooks/school/use-<modulo>.ts` (React Query) → componente**. Os componentes não chamam a API directamente.
Onde um componente usava um store, o hook novo devolve **a mesma forma** (listas + acções), para que o componente só mude a origem dos dados.

## Ambiente
`.env`: `NEXT_PUBLIC_API_URL=http://localhost:3011/api/v1`, `NEXT_PUBLIC_APP_URL=http://localhost:3001`, `NEXT_PUBLIC_BYPASS_AUTH=false`.
A API tem de ter `CORS_ORIGINS=http://localhost:3001`. Dados de demonstração: `node scripts/dev-demo-data.mjs` (repositório da API); logins `titular@demo.ao`, `secretaria@demo.ao`, `professor@demo.ao` (password `Demo-Escola-Segura-2026`).
Flag opcional: `NEXT_PUBLIC_SHOW_UNLINKED_MODULES` (já sem efeito: todos os módulos do menu têm API).

## Como funciona
- **Sessão:** a API é usada em modo `x-auth-mode: bearer`. O login (server action `actions/login.ts`) guarda `access_token`/`refresh_token` em cookies httpOnly; o refresh passa pela rota `/api/auth/refresh` (valida a origem). O papel fica num cookie assinado pelo servidor. Se a conta tem segundo factor, o login devolve `requiresMfa` e o formulário pede o código (TOTP ou de recuperação); passkeys ainda não têm ecrã.
- **Escola activa:** `stores/school/active-school-store.ts` (persistida). Os serviços usam URLs `"/s/students"`, que o interceptor de `services/api.ts` converte em `/schools/{schoolId}/students`. O seletor de escola está no cabeçalho da barra lateral (trocar recarrega a aplicação).
- **Papéis:** `utils/api-roles.ts` converte `titular → DIRECTOR_GENERAL`, `direccao_pedagogica → PEDAGOGIC_DIRECTOR`, `secretaria → SECRETARY`, `professor → TEACHER`, `financeiro → FINANCIAL`, `encarregado → GUARDIAN`, `aluno → STUDENT`, `auditor_med → MED_AUDITOR`, `admin_sistema → SYSTEM_ADMIN`; vale o de maior autoridade na escola activa. As permissões reais são as da API (403 vira mensagem).
- **Planos:** `essencial → Base`, `profissional → Smart`, `enterprise → Pro` (`utils/map-api-user.ts`); o estado da subscrição vem de `GET /schools/:id/subscription`.
- **Paginação:** a API usa cursor; `services/api-pagination.ts#fetchAllPages` lê tudo (tecto de 2000) e a paginação visível é no cliente.
- **Erros:** o interceptor põe em `error.message` o `errors[0].message`/`detail` (RFC 9457); `getApiErrorMessage` faz o mesmo.

## Estado por módulo
| Módulo | Estado |
| --- | --- |
| Login (com MFA), sessão, escola activa, subscrição (banner de trial) | **Integrado** |
| Alunos (lista, criar com encarregado + matrícula, editar, desactivar) | **Integrado** |
| Matrículas (lista, nova, anular), Encarregados (lista, criar/editar, vínculos) | **Integrado** |
| Turmas, Disciplinas, Atribuições (professor × disciplina × turma) | **Integrado** |
| Lançamento de notas (MAC/NPP/NPT → avaliações da API), Pautas (consolidado, fechar, reabrir), Transições (proposta do motor) | **Integrado** |
| Admissões (candidaturas, validação, nota da prova, decisão, conversão em matrícula, sessões de prova) | **Integrado** |
| Propinas (facturas, pagamentos com Idempotency-Key, comprovativo PDF, tabela de preços = `settings.finance`) | **Integrado** |
| Documentos oficiais (emitir e abrir PDF) | **Integrado** (guia de transferência não existe na API) |
| Circulares (comunicados da escola/turma) | **Integrado** (sem tipo/evento/RSVP: a API guarda comunicados simples) |
| Risco de abandono (lista, acções, estado) | **Integrado** (lê os alertas calculados pela API) |
| Assiduidade dos alunos (chamada, mapa da turma, justificação de faltas pela secretaria/direcção) | **Integrado** (o livro de disciplina foi retirado: a API não o tem) |
| Assiduidade docente (lista do dia, terminal de ponto por QR, QR dinâmico do professor) | **Integrado** (cartões físicos e justificação de ausência ainda não) |
| Relatórios (catálogo com pré-visualização e exportação XLSX/PDF/CSV) e Mapas MED (snapshot → validar → aprovar → exportar → submeter) | **Integrado** |
| Dashboard (directores, secretaria, financeiro) | KPIs de alunos, ocupação e propinas **reais**; os restantes widgets ficam vazios |
| Definições da escola (dados institucionais, trimestres, fechar trimestre) | **Integrado**; parâmetros de avaliação e feriados ainda locais |
| Provas online (nativas e **Google Forms**: criar formulário, importar respostas, corrigir, lançar na mini-pauta) | **Integrado** (requer plano Pro no menu; Google Forms exige ligar a conta Google da escola) |
| Portal da Família (`/portal`): notas, reapreciação, propinas, provas online, horário, assiduidade, documentos, comunicados, calendário e requerimentos | **Integrado** (encarregado/aluno) |
| Fase 6: estados de nota (ausente/dispensado/não avaliado) no lançamento, reapreciação de notas, conselhos de turma (acta PDF), exames finais, sessões da prova de acesso (`/grades/reviews`, `/grades/councils`, `/grades/final-exams`, `/admissions/sessions`) | **Integrado** (sem ligação de interface: importação CSV de notas com estados) |
| Horários (versões, grelha por turma/professor, tempos, salas, validar, publicar e pedidos de mudança com data de efeito) | **Integrado** |
| Calendário Escolar (`/academic/calendar`: eventos, importação do calendário nacional, feriados/pontes, Google Calendar) e Aulas e Sumários (`/academic/lessons`) | **Integrado** (plano Profissional; sem solver de horários) |
| Administração: Corpo Docente (fichas, estado, cartões e QR de ponto), Utilizadores e Papéis, Importação CSV (alunos, matrículas, notas), Auditoria, Políticas da Escola (avaliação, exames, admissão, calendário, risco, pagamento) | **Integrado** |
| Painel da Plataforma (`/admin/platform`: MRR, revisão de comprovativos, outbox) | **Integrado** (só `admin_sistema`) |
| Segurança da conta (`/settings/security`: sessões, TOTP, passkeys, códigos de recuperação) | **Integrado** |
| Subscrição (plano actual, catálogo, simulação, ordem e comprovativo em `/subscription` e `/plans`) | **Integrado** (comprovativo por base64; sem checkout online) |
| Grupos / Painel Multi-Escola (`/reports/multi-school`: indicadores por escola e membros) | **Integrado** (utilizadores só de grupo, sem escola, ainda não têm sessão própria no frontend) |
| Biblioteca, Saúde e Psicopedagogia, Transporte, Extracurriculares, Requerimentos (protocolo) | **Integrado** (módulos novos da API; sem controlo de embarque, assiduidade de actividades nem taxas/SLA) |
| Notificações (sino) | **Integrado** (feed por utilizador com consulta periódica; sem tempo real) |

## Notas técnicas
- `PATCH /schools/:id` **substitui** `settings` por inteiro: o frontend usa `patchSettings` (`services/school-settings-service.ts`), que lê, funde e envia tudo. Nunca enviar só um bloco.
- Rotas: cada página herda a lista de papéis do menu (`constants/menu-items.tsx`); quem não consta recebe `/unauthorized` (a API continua a ser a barreira final). Encarregado/aluno entram em `/portal`.
- Dev: `node scripts/dev-portal-user.mjs` (repositório da API) cria `encarregado@demo.ao`.

## Lacunas conhecidas
- A API não guarda morada/cidade/nacionalidade do aluno nem n.º de processo (usa-se o documento).
- Não há "apagar" aluno (só `inactivo`), nem "alterar palavra-passe" autenticado.
- As notas identificam-se pela **matrícula**; a mini-pauta usa uma avaliação por tipo e período (MAC = contínua, NPP = sistemática, NPT = prova periódica).
- O ecrã de notas mostra os campos editáveis a quem não tem permissão (o servidor recusa com 403).
- Os valores e o sidebar "SIMULADOR RBAC" são ferramentas de desenvolvimento do MindGest.

## Próximos passos
1. Disponibilidade dos professores, substituições em lote e solver de horários.
2. Justificação de ausências docentes; sobreposições de entitlements e gestão de escolas na plataforma.
3. Alterar palavra-passe autenticado (a API não tem); notificações em tempo real.
