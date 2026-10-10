# Auditoria do frontend — refactoração, componentes padrão e organização

Data: 2026-10-10 · Âmbito: `mindschool-frontend/src` (65 170 linhas, ~700 ficheiros `.ts/.tsx`).
Método: contagens por `grep` e uma análise de símbolos exportados que não são referenciados por nenhum outro ficheiro (excluindo barrels). **Os números são medidos; os «órfãos» são candidatos a remoção e devem ser confirmados antes de apagar** (uma referência dinâmica ou por nome de ficheiro não seria detectada).

Gravidade: 🔴 alta · 🟠 média · 🟡 baixa.

## 1. Resumo

| # | Tema | Gravidade | Medida |
|---|---|---|---|
| 1 | Código morto / herdado do MindGest | 🔴 | 93 ficheiros candidatos a órfãos (~8 800 linhas, 13 % do código) |
| 2 | Stores Zustand com dados simulados ainda em uso | 🔴 | 20 stores (~7 600 linhas); 10 sem nenhum consumidor |
| 3 | Dependências não usadas | 🟠 | 14 em `dependencies` (FullCalendar, socket.io, MCP…) |
| 4 | Componentes padrão ignorados | 🟠 | 12 `<button>`, 11 `<input>`, 7 `<table>`, 3 `Dialog` directos, 2 `alert()` |
| 5 | Formatação duplicada (moeda/datas/estados) | 🟠 | 9 `kz`, 19 `toLocaleString`, 23 `toLocaleDateString`, 51 mapas `*_LABEL` |
| 6 | Organização de pastas | 🟠 | `components/client` com 217 ficheiros; 3 sistemas de tabela; barrel gigante |
| 7 | Estrutura de páginas (Next) | 🟠 | 0 `loading.tsx`/`error.tsx`; 22 páginas sem `PageWrapper` |
| 8 | Ficheiros grandes | 🟠 | 12 ficheiros > 400 linhas |
| 9 | Tipagem e qualidade | 🟡 | 78 `any`, 11 `eslint-disable`, 5 `console.log` |
| 10 | Testes | 🔴 | 2 suites jest (100 testes); Playwright configurado sem testes |
| 11 | Data fetching | 🟠 | 221 `queryKey` inline; 19 componentes com `useQuery` directo |
| 12 | Estilo / tema | 🟡 | 388 cores fixas Tailwind (`bg-gray-500`…), 17 hex |
| 13 | Acessibilidade | 🟡 | 4 botões-ícone sem rótulo; 1 `div` com `onClick` |
| 14 | Dois registos de navegação | 🟠 | `menu-items.tsx` (617 l.) e `navigation.ts` (201 l.) |

## 2. Detalhe

### 2.1 Código morto / herdado do MindGest 🔴
93 ficheiros cujos símbolos exportados não são usados por nenhum outro ficheiro. Por grupos:

- **Stores simuladas** (ver 2.2).
- **Esqueletos de outros produtos**: `skeletons/` `pos-*`, `sales-skeleton`, `supplier-details`, `product-modal`, `produc-card`, `stock-summary`, `invoice-form/filters`, `items-filters`, `clients-*`, `service-modal` (≈ 13 ficheiros).
- **Utilitários fiscais do MindGest**: `utils/credit-note-correction.ts`, `utils/credit-note-reasons.ts` (notas de crédito estão fora de âmbito no MindSchool), `schemas/company.ts`, `constants/products.ts`, `constants/company.ts`, `utils/format-price.ts`, `utils/calculate-day.ts`, `utils/client.ts`, `utils/get-user-role.ts`.
- **Funcionalidade sem rota**: `features/contributors/*`, `app/api/contributors/*`, `virtual-keyboard`, `manager-auth-modal`, `school-module-placeholder`, `components/custom/section-cards.tsx`, `universal-table/custom-tables/users-table.tsx`, `input-fetch/async-select|async-multi-select` (590 l.), `certificate-preview-modal`.
- **Serviços sem consumidor** (verificar antes): `attendance`, `certificates`, `circulars`, `dropout-risk`, `multi-school`, `online-exams`, `reports-med`, `settings`, `public-api`.
- **Hooks sem consumidor**: `useAuditFilters`, `useGetAuditTrailDetails`, `useSendChatMessage`, `useFetchById`, `useLocalPagination`, `usePagination`, `useFileUpload`, `useURLSearchParams`, `useAttendance`, `usePlans`, `useGetUser(s)`.
- **Na raiz do repositório**: `scripts-tmp-auth2.mjs`, `walkthrough.md`, `tsconfig.tsbuildinfo`, `graphify-out/`, `docs/CONFORMIDADE_MINDGEST.md`, `src/doc/*.md` (6 notas de produto), `src/assets/store-scanner-beep.mp3`.
- **Erro de escrita**: `utils/donwload.file.ts`.

**Acção:** remover em lote por grupo, com `tsc` + `jest` + `next build` a validar cada lote.

### 2.2 Stores com dados simulados 🔴
`stores/school/*-store.ts` (grade, transport, online-exam, health, timetable, library, extracurricular, secretary-request, tuition, school-data) somam ~3 700 linhas e **nenhum componente as usa**. Outras estão ligadas a hooks mas contornam a API:

- `reports-med-page-content.tsx` e `academic-performance-content.tsx` usam `useReportsMedStore`/`useAcademicPerformanceStore` e **são eles próprios órfãos** (as páginas reais usam outros componentes).
- `use-attendance.ts` usa `student-attendance-store` e `teacher-attendance-store` (465 + 349 l.) e o hook não é consumido.
- `stores/school/initial-data/*` (805 l.) é dado de demonstração dentro do bundle.

Risco: quem lê o código não sabe qual é a fonte da verdade; alguém pode ligar uma página à store errada. **Acção:** apagar as stores mortas; manter só `active-school-store`, `school-settings-store`, `multi-school-store` e as de UI (modal, notificações, onboarding, auth).

### 2.3 Dependências não usadas 🟠
`@fullcalendar/*` (5 pacotes), `@modelcontextprotocol/sdk`, `@tanstack/ai-mcp`, `axios-mock-adapter`, `html5-qrcode`, `jsbarcode`, `node-thermal-printer`, `print-js`, `socket.io-client`, `@types/qrcode`. Os três últimos vêm do POS do MindGest. Reduz tempo de instalação, superfície de CVEs e risco de supply chain. Em dev: `orval`, `ts-node`, `baseline-browser-mapping` sem uso aparente (confirmar).

### 2.4 Componentes padrão ignorados 🟠
| Padrão | Deveria ser | Onde |
|---|---|---|
| `<input>` cru | `Input` / `FormInput` / `FileUpload` | `plan-checkout`, `subscription-manager`, `portal-payments`, `imports-page-content`, `exam-taker`, `add-question-modal` |
| `<table>` cru | `DataList` (64 usos) | `family-evolution`, `family-finance`, `grade-entry-table`, `consolidated-pauta-modal`, `med-map-preview-modal` |
| `<button>` cru (12) | `Button` | vários |
| `Dialog` directo | `GlobalModal` | `honor-diploma-modal`, `date-picker-input`, `data-table-toolbar`, `tutorials-modal` |
| `alert()` (2) | toast padrão | `file-upload`, `photo-upload` |
| `toast` de `sonner` directo (59) vs `utils/messages` (21) | um só canal (`SucessMessage`/`ErrorMessage`) | transversal; hoje coexistem dois estilos |
| Upload de ficheiros | um único `FileUpload` | 4 implementações distintas (`file-upload`, `photo-upload`, input nativo em 3 sítios) |

Nota: algumas tabelas cruas (pautas, notas) são justificáveis por terem edição inline; criar um `EditableGrid` partilhado em vez de repetir `<table>`.

### 2.5 Formatação duplicada 🟠
- `kz`/`money` redefinido em 9 ficheiros (`platform-page-content`, `family-dashboard`, `family-finance`, `portal-payments`, `multi-school-page-content`, `subscription-manager`, `finance-dashboard`, `dashboard-overview`, `tuition-service`) apesar de existir `utils/format-currency.ts`.
- 19 `toLocaleString("pt-AO")` e 23 `toLocaleDateString` inline, com `utils/format-date.ts` disponível.
- 51 mapas de rótulos (`STATUS_LABEL`, `ORDER_LABEL`…) declarados dentro dos componentes. Devem viver junto do domínio (`constants/labels/<dominio>.ts`) para reutilizar em listas, filtros e badges.
- Dois formatadores: `format-currency.ts` e `format-price.ts` (este sem uso).

**Acção:** um módulo `lib/format` (moeda, data, percentagem) e um `StatusBadge` com a tabela de estados por domínio.

### 2.6 Organização de pastas 🟠
- `components/` tem 9 pastas com fronteiras difusas: `common`, `custom`, `shared`, `templates`, `ui`, `modal`, `guards`, `auth`, `client`. `custom/` e `common/` misturam inputs (`price-input`, `select-input`) com tabelas e gráficos; `modal/` e `common/modal|form-modal|confirm-modal` repetem o conceito.
- **Três sistemas de tabela**: `common/data-list` (64 usos, o padrão), `common/generic-table` (2) e `custom/universal-table` (2, herdado). Convergir para `DataList`.
- `components/client` (217 ficheiros) é plano por domínio, mas há nomes inconsistentes: `family` (pasta nova) vs `portal` (legado), `subscription` vs `plans`, `teachers-attendance`.
- `@/components` é um barrel único com centenas de exports: dificulta tree-shaking e cria ciclos (`plan-catalog` importa de `@/utils`, que importa de `@/components`…). Preferir imports por pasta nos módulos novos.
- Raiz de `src`: `@types`, `doc`, `features`, `actions`, `contexts`, `providers`, `lib`, `utils` com sobreposição (`lib/` vs `utils/`; `contexts/` vs `providers/`; `providers/use-access-control.ts` é um hook, não um provider; `lib/find-menu-item.ts` e `lib/get-sidebar-for-user.tsx` pertencem a `navigation`).
- Proposta de estrutura-alvo:
```
src/
  app/                    rotas (finas: só compõem)
  modules/<dominio>/      components/ hooks/ services/ types.ts labels.ts   (academic, admissions, finance, family, …)
  shared/ui/              shadcn (actual components/ui)
  shared/components/      DataList, FormModal, GlobalModal, PageWrapper, StatusBadge…
  shared/lib/             format, api, navigation, access-control
  shared/hooks|stores/    só o transversal (modal, auth, active-school)
```
Migração gradual por domínio, começando por `finance` e `family` (já os mais limpos).

### 2.7 Estrutura de páginas Next 🟠
- 0 `loading.tsx`, 0 `error.tsx`, 1 `not-found.tsx`: cada página implementa o seu esqueleto/erro. Acrescentar `loading.tsx` e `error.tsx` por segmento (`(main)`, `settings`, `familia`) dá streaming e recuperação de erro sem código por página.
- 22 páginas sem `PageWrapper` (admissions, certificates, enrollments, guardians, students, teachers, settings/*…): título, breadcrumb e tour ficam inconsistentes. Em 62 sítios `routeLabel/subRoute` repete o que o registo de navegação já sabe (item já listado como pendência).
- 10 páginas com `"use client"` no próprio `page.tsx`; 256 de 352 componentes são client. Páginas deviam ser Server Components que compõem componentes client só onde há estado.

### 2.8 Ficheiros grandes 🟠
`use-onboarding-tour.ts` 951 · `ui/sidebar.tsx` 792 (shadcn, aceitável) · `admission-store.ts` 648 · `menu-items.tsx` 617 · `chatbot/index.tsx` 611 · `grade-store.ts` 530 · `async-select.tsx` 439 (órfão) · mais 12 entre 300 e 400 (`applications-list`, `candidate-application-modal`, `application-details-modal`, `grade-entry-table`, `enrollment-modal`…).
Prioridade: `use-onboarding-tour` (separar definição dos tours, motor e preferências), `chatbot` (separar UI, estado e serviço) e os 3 modais de admissões (extrair secções de formulário).

### 2.9 Tipagem e qualidade 🟡
78 `any`, 11 `eslint-disable`, 5 `console.log`. `strict: true` activo. Os tipos de API vivem espalhados: `types/*.ts` (33 ficheiros, alguns legados) e interfaces `Api*` dentro de cada `services/*-service.ts`. Unificar: tipos de API junto do serviço do domínio; `types/` só para modelo de UI partilhado.

### 2.10 Testes 🔴
2 suites (`navigation`, `map-api-user`), 100 testes, quase todos de navegação. Playwright está configurado (`test:e2e`) mas `tests/` só tem `unit`. Sem testes para formulários, `DataList`, fluxos de checkout/pagamento, guards de acesso, nem para o cliente `api.ts` (refresh de token). **Acção mínima:** (a) testes de componente (Testing Library) para `DataList`, `FormModal`, `PageWrapper`; (b) 5 fluxos Playwright: login por papel, matrícula, lançamento de notas, registo de pagamento, checkout de subscrição; (c) CI com `lint + tsc + jest + build`.

### 2.11 Data fetching 🟠
221 `queryKey: [...]` literais e 19 componentes com `useQuery/useMutation` directo (fora de `hooks/`). Risco: chaves inconsistentes impedem invalidar correctamente. Criar `queryKeys.ts` por domínio e mover a lógica para hooks `use<Dominio>`; `fetchAllPages` deve ser a única forma de carregar listas completas.

### 2.12 Estilo e tema 🟡
388 utilitárias de cor fixa (`bg-gray-*`, `text-red-*`…) e 17 hex fora de `ui/`, em vez de tokens (`bg-muted`, `text-destructive`, `bg-primary/10`). Quebra o tema escuro e a paleta primária. Tornar regra de lint (`no-restricted-syntax` para classes de cor fixas) e migrar por ficheiro.

### 2.13 Acessibilidade 🟡
4 `Button size="icon"` sem `aria-label`; 1 `div` com `onClick`. Sem teste automático (`jest-axe`/`@axe-core/playwright`).

### 2.14 Dois registos de navegação 🟠
`constants/menu-items.tsx` (617 l.: papéis, ícones, planos) e `constants/navigation.ts` (201 l.: módulos, rail, breadcrumbs) descrevem a mesma árvore. Qualquer página nova exige editar os dois (e há teste só para garantir que coincidem). Fundir num único registo declarativo por página: `{ url, label, icon, module, roles, minPlan }`, de onde derivam menu, rail, breadcrumb e controlo de acesso.

## 3. Plano de execução proposto

| Fase | Conteúdo | Risco | Esforço |
|---|---|---|---|
| 1 | Remover órfãos e stores simuladas; remover dependências; limpar raiz do repo | baixo (validado por `tsc`/`build`) | 1 dia |
| 2 | `lib/format` + `StatusBadge` + labels por domínio; um canal de toast; substituir `alert()` | baixo | 1–2 dias |
| 3 | `loading.tsx`/`error.tsx`; `PageWrapper` nas 22 páginas; remover `routeLabel/subRoute` redundante | baixo | 1 dia |
| 4 | Convergir tabelas (`GenericTable`, `UniversalTable` → `DataList`); `EditableGrid`; um `FileUpload` | médio | 2–3 dias |
| 5 | Registo de navegação único | médio | 1–2 dias |
| 6 | Reorganização para `modules/<dominio>` (por domínio) + `queryKeys` | médio-alto | contínuo |
| 7 | Testes (componentes + Playwright) e CI | — | 2–3 dias, em paralelo |
| 8 | Dividir ficheiros > 400 linhas; reduzir `any`; regra de lint para cores fixas | baixo | contínuo |

Recomendação: começar pelas fases 1 e 7 (limpar e proteger); só depois mover pastas.

## 4. Limitações da análise
- «Órfão» = nenhum outro ficheiro referencia os nomes exportados; imports dinâmicos ou por string não são detectados.
- Não foi medido desempenho de runtime, tamanho de bundle nem acessibilidade com ferramenta automática.
- Não foram revistos o backend nem o `legacy-scaffold` da API.

## 5. Fase 1 — executada (2026-10-10)

Resultado: **65 170 → 49 434 linhas (−24 %)**, ~700 → 638 ficheiros `.ts/.tsx`; 13 dependências removidas.

- **Órfãos removidos** em 3 rondas iterativas (cada ronda revelou novos órfãos, ignorando menções em comentários): stores simuladas e `initial-data`, esqueletos de POS/vendas/stock, `input-fetch/async-*`, `virtual-keyboard`, `universal-table` (tabela herdada e subcomponentes), modais e página de relatórios MED/académico antigos, `features/contributors`, serviços/hooks/schemas/tipos sem consumidor, utilitários fiscais do MindGest (`credit-note-*`), constantes de produtos/empresa, `plan-inclusion-features`.
- **Barrels** (`index.ts`) corrigidos e pastas vazias apagadas.
- **Dependências removidas**: `@fullcalendar/*` (5), `@modelcontextprotocol/sdk`, `@tanstack/ai-mcp`, `axios-mock-adapter`, `html5-qrcode`, `jsbarcode`, `node-thermal-printer`, `print-js`, `socket.io-client`. (`@types/qrcode` e os `@types/*` mantêm-se: são tipos de pacotes em uso.)
- **Raiz/assets**: removidos `scripts-tmp-auth2.mjs`, `public/express.png`, `public/kwik.png`, `src/assets/{AI.png,IconGoogle.svg,store-scanner-beep.mp3}`; `src/doc/*.md` e `walkthrough.md` movidos para `docs/legacy/`.
- **Validação**: `tsc` sem erros em `src`; ESLint 0 erros (149 avisos já existentes); jest 100/100; servidor de desenvolvimento compila `/`, `/auth/login` e `/billing` sem `Module not found`. `next build` não pôde concluir neste ambiente porque o Next não consegue descarregar as fontes do Google (falha de rede do processo, não de código) — correr o build no CI/máquina com acesso.
- **Não tocado** (para fases seguintes): `hooks/use-mobile.ts` (usado por `ui/sidebar`, o analisador trata `ui/*` como barrel), `utils/audio.ts`, `public/Documentation/` (exportação do Notion), `docs/CONFORMIDADE_MINDGEST.md`.
- Cópia de segurança de `src` e `package.json` antes da limpeza guardada fora do repositório (scratchpad da sessão).

## 6. Fase 2 — executada (2026-10-10)

- **Formatação única.** `utils/format-number.ts` (`formatNumber`, `formatPercent`) junta-se a `formatCurrency`/`formatCurrencyCompact` (agora aceitam `null/undefined`) e `formatDate/formatDateTime`. Migradas com `ast-grep`: 29 `toLocale*String("pt-AO")` e os 7 `kz` locais (nenhum `kz` local resta; `plan-catalog` delega no formatador comum). Ficam, de propósito, as ~10 chamadas `toLocaleDateString` com opções (dia da semana, mês por extenso, `dateStyle`), que não têm equivalente comum.
- **Um só canal de toast.** `utils/messages.ts` (`SucessMessage/ErrorMessage/WarningMessage/InfoMessage`) é o único módulo que importa `sonner` (para além do `<Toaster>`): 238 chamadas migradas em 58 ficheiros. Os 2 `alert()` (`file-upload`, `photo-upload`) usam agora `ErrorMessage`.
- **Rótulos e estados.** `constants/labels/` (`med`, `guardians`) elimina os mapas duplicados de MED e parentesco. Novo `StatusBadge` genérico (`components/common/status-badge`: estado + tabela `{label, variant}`) adoptado em pedidos de secretaria (`RequestStatusBadge`), provas online, pedidos da biblioteca (escola e família) e facturas de propinas, substituindo 4 implementações ad-hoc.
- **Validação**: `tsc` 0 erros em `src`; ESLint 0 erros (149 avisos, igual à fase 1); jest 100/100.
- **Fica para depois**: restantes mapas `*_LABEL` de uso único (não são duplicados; só ganham em mover para `constants/labels/<dominio>` quando o ecrã for reorganizado na fase 6) e `StatusBadge` nos ~140 `Badge` com variante inline.

## 7. Fase 3 — executada (2026-10-10)

- **`loading.tsx` / `error.tsx`**: `app/(client)/(main)/loading.tsx` (esqueleto de página) e `error.tsx` (`RequestError` com «Tentar novamente» via `reset`, a barra lateral mantém-se), mais `app/error.tsx` como rede de segurança para login, facturação, etc. Cobrem todas as 81 rotas sem código por página.
- **«22 páginas sem `PageWrapper`»**: afinal 17 eram redireccionamentos (`redirect()`), que não precisam dele; `dashboard` já o tem dentro de `DashboardPageContent`. As reais: `settings/general` (cabeçalho feito à mão) passou a redireccionar para `/settings`, como as irmãs; `billing` e `auth/*` ficam fora de propósito (layouts próprios).
- **`routePath/routeLabel/subRoute` redundantes**: um teste temporário (já removido) calculou, por papel, que páginas têm o breadcrumb coberto pelo registo de navegação — 51 páginas; as três props foram retiradas delas. `subRoute` passou a opcional em `PageWrapper`. Ficam, por necessidade, em 9 páginas fora do registo ou dinâmicas (`/notifications`, `/subscription`, `/plans/checkout`, `/secretary/requests`, `/admissions/exams`, `/students/admissions/exams`, `/settings/export`, `/familia/provas/[id]`).
- **Validação**: `tsc` 0 erros em `src`; ESLint 0 erros; jest 100/100; o servidor de desenvolvimento compila e serve `/auth/login`, `/billing` e `/unauthorized` (200) sem erros de módulo. Nota: o cache do Turbopack corrompeu-se uma vez (pânico interno do Next) e foi preciso limpar `.next`; não está relacionado com o código.
- **Não feito**: validação visual do breadcrumb em sessão autenticada nas 51 páginas (a lógica está coberta pelos testes de `deriveBreadcrumb`, mas não abri cada página).

## 8. Fase 4 — executada (2026-10-10)

- **Tabelas.** A leitura inicial («3 sistemas») estava desactualizada depois da fase 1: `universal-table` já foi removida e `GenericTable` é o motor interno do `DataList` (camadas, não duplicação). O que restava eram tabelas cruas: novo `SimpleTable` (`components/common/simple-table`, sobre os primitivos `ui/table`) substitui as 2 tabelas de leitura da área da família (evolução por disciplina, extracto por mês). Ficam como `<table>` nativo, de propósito, a grelha de lançamento de notas e a matriz de pauta consolidada (células editáveis/colunas fixas dinâmicas, com um único consumidor cada — abaixo das 3 utilizações que justificam um `EditableGrid` partilhado). Na grelha de notas extraiu-se `ScoreCell` (a célula repetida 3×), com o mesmo markup (sem alteração visual); −75 linhas.
- **Upload único.** `components/common/file-upload` é agora o único componente de carregamento (arrastar ou escolher; controlado; valida tipo e tamanho; presets `PROOF_ACCEPT`, `PROOF_ACCEPT_PDF_PNG`, `CSV_ACCEPT`). Removidos o antigo `FileUpload` (acoplado a react-hook-form e sem uso) e o `PhotoUpload` (sem uso). Migrados os 5 `<input type="file">` nativos: checkout de subscrição, envio de comprovativo da subscrição, importação CSV e, no portal de pagamentos, o comprovativo de propinas e a substituição (que passou de «abrir selector escondido» para um modal próprio).
- **Validação**: `tsc` 0 erros em `src`; ESLint 0 erros (145 avisos, −4); jest 100/100.
- **Por validar em sessão autenticada** (não abertos no navegador): o modal de substituição de comprovativo no portal, a importação CSV e a grelha de notas (refactor sem alteração de markup).

## 9. Fase 5 — executada (2026-10-10): registo de navegação único

**Antes:** `menu-items.tsx` (617 linhas: papéis, planos, ícones, árvore) e `navigation.ts` (módulos/secções + um mapa de ícones à parte) descreviam a mesma árvore; acrescentar uma página exigia editar os dois.

**Agora:** `constants/navigation-registry.ts` é a única fonte de verdade (≈150 linhas, só dados): `MODULES` (rail, secções) e `PAGES` (nome, rota, ícone, papéis, plano mínimo, módulo › secção). Dele derivam:
- `menu-items.tsx` (65 linhas): a árvore em acordeão (secção rotulada = grupo; `loose`/sem rótulo = páginas soltas);
- `navigation.ts`: a estrutura modular (escola/família), `PLACED_KEYS` e os ícones das sub-páginas;
- `lib/find-menu-item.ts` (acesso por rota) e `getSidebarForUser`, sem alteração (consomem a árvore derivada).

**Para acrescentar uma página:** uma linha em `PAGES` (e, se for um módulo novo, uma entrada em `MODULES`). Os testes (`navigation-registry.test.ts`) falham se o módulo/secção não existirem, se houver duplicados ou se uma página misturar papéis da escola e da família.

**Prova de equivalência** (teste temporário, já removido): para os 12 papéis × 5 cenários (sem subscrição, Base, Smart, Pro, pendente) o modelo (módulos, secções, páginas, ícones, ordem), o modo da sidebar, a árvore em acordeão dos papéis em modo `flat` e a resolução de acesso por rota (`findMatchingMenuItem`) ficaram **idênticos** ao anterior. Única diferença, sem efeito visível: a ordem interna da árvore dos papéis em modo `dual`/`grouped`, que a sidebar não usa (usa o modelo modular).

**Inconsistência preservada, a decidir:** o grupo «Alunos & Matrículas» não aparece aos Professores (`groupRoles`), embora a página «Sessões da Prova de Acesso» admita o papel Professor — por isso o professor só lhe chega por URL. Mantido tal como estava (`groupRoles` em `MODULES`); se for para o professor ver as sessões na sidebar, basta retirar `groupRoles` dessa secção.

**Validação:** `tsc` 0 erros; ESLint 0 erros; jest 104/104 (+4 do registo).

## 10. Fase 6 — em curso (2026-10-10): `src/modules/<dominio>` + `queryKeys`

**Convenção** (já aplicada a Finanças e Família; os restantes domínios seguem o mesmo molde):
```
src/modules/<dominio>/
  components/   ecrãs e modais do domínio (o que antes vivia em components/client/<dominio>)
  hooks/        use-*.ts do domínio (antes hooks/school/)
  services/     *-service.ts do domínio (antes services/)
  types.ts      tipos do domínio (antes types/)
  query-keys.ts <dominio>Keys: único sítio onde se criam e invalidam as chaves de cache
```
Regras: um módulo importa de outro só pelo caminho explícito (`@/modules/outro/...`), nunca através de barrels globais; `app/**/page.tsx` fica fino e importa do módulo; o que é transversal (api, DataList, PageWrapper, formatadores…) continua em `components/common`, `services/api*`, `utils`.

**Feito**
- `modules/finance` (propinas, comprovativos, facturas, tabelas de preço, taxas de documentos, relatórios de tesouraria): 13 componentes, 3 hooks, 3 serviços, tipos; `financeKeys` (substitui 21 chaves literais, incluindo emails da escola/plataforma e o portal de pagamentos).
- `modules/family` (área da família): 14 componentes (incl. `family-dashboard` e `portal-payments`), hooks `use-portal`/`use-family-student`, `portal-service`; `familyKeys` (19 chaves). A invalidação cruzada «pagamento → facturas do portal» usa `familyKeys.invoices` a partir de Finanças.
- Barrels globais (`hooks/school`, `services`, `types`, `components/client`) deixaram de exportar estes domínios.
- Validação: `tsc` 0 erros; ESLint 0 erros (145 avisos); jest 104/104. **Não validado em runtime**: a API de desenvolvimento não estava a correr, por isso as páginas de Finanças e Família não foram abertas com sessão iniciada.

**Por migrar** (mesmo procedimento, um domínio de cada vez): académico (turmas, disciplinas, horários, calendário, aulas, faltas), admissões, avaliação/pautas, secretaria/certificados, comunicação, estudantes/matrículas/encarregados, vida escolar (biblioteca, saúde, transporte, extracurriculares), provas online, risco de abandono, relatórios, assiduidade docente, definições, subscrição/planos, administração da plataforma, dashboard.

### 10.1 Validação em navegador (2026-10-10) — Finanças e Família
API de desenvolvimento (porta 3011, BD `mindschool_dev`) e frontend (3001), sessões reais com as contas demo.
- **Finanças (titular):** `/tuition` (painel com dados reais), `/tuition/submissions`, `/payments`, `/invoices`, `/plans` (+ taxas de documentos) e `/collections` abrem sem erros de consola e com o breadcrumb «Propinas & Finanças › Página».
- **Família (encarregado):** `/dashboard`, `/familia/financeiro` (separadores Por pagar e Extracto anual — `SimpleTable`) e `/familia/aproveitamento` (Evolução e boletins — `SimpleTable`) mostram os valores correctos; sidebar em modo agrupado.
- **`FileUpload`:** rejeita `.txt` com a mensagem «Tipo de ficheiro não suportado» e aceita PNG.
- **Fluxo ponta a ponta:** o encarregado submeteu um comprovativo (PNG de 86 KB). Sem recarregar, a lista «Os meus comprovativos» ganhou o PGT-2026-00002 «Por validar», «Em análise» passou a 2.500 Kz e a factura mostra «em análise» — logo as invalidações de cache cruzam correctamente Finanças (`financeKeys`) e Família (`familyKeys.invoices`). No servidor, a imagem foi reprocessada pelo `sharp` (89 107 B guardados vs 88 398 B enviados). Na conta do financeiro, o mesmo comprovativo aparece na fila «Por validar».
- **Defeito encontrado e corrigido:** o `TrialBanner` (subscrição) pedia `/subscription` e `/subscription/orders` mesmo aos papéis sem permissão (encarregado), gerando 403 repetidos; agora o hook só corre para quem gere a subscrição.
- **Observações sem relação com a reorganização** (já existiam): o encarregado ainda recebe 1× 403 em `GET /schools/:id` e em `GET /subscription` durante o arranque; a validação do servidor exige um tamanho mínimo para o comprovativo (um PNG 1×1 devolve 422 `too_small`).
- **Fora desta validação:** os restantes separadores de Família (horário, calendário, disciplinas, provas, biblioteca, documentos, comunicados) e o modal de substituição de comprovativo não foram percorridos.

### 10.2 Correcções do varrimento de bugs e tipografia (2026-10-10)
Percorridas, com a API de desenvolvimento a correr, todas as páginas do titular (≈50, incluindo os separadores de Definições) e todas as da família.
- **404 `/onboarding`** (em todas as páginas com tour): a API não tem esse módulo. O onboarding passa a ser local por omissão (`NEXT_PUBLIC_ONBOARDING_REMOTE=true` reactiva a chamada).
- **404 `/lessons/mine`** para quem não é professor: «Aulas e Sumários» abre em «Todas» para os restantes papéis.
- **403 no encarregado/aluno** (`/subscription`, `GET /schools/:id`, `risk-alerts`, `requests`, `students`, `enrollments`): o login e o perfil da escola já não os pedem a papéis sem permissão, e o dashboard só carrega alertas/pedidos para quem tem visão da escola (`useDropoutRisk(enabled)`, `useSecretaryRequests(portal, enabled)`).
- **Tipografia:** **Outfit** é a fonte principal, servida localmente (`@fontsource-variable/outfit`; verificado no navegador: `Outfit Variable` carregada). Antes o CSS dizia «Outfit» mas o ficheiro nunca carregava e o `next build` falhava sem rede (Google Fonts). Alternativas em Definições › Aparência: Inter e Sistema; a escolha (e a cor) passam a aplicar-se ao arrancar, em qualquer página, e o formato antigo guardado é migrado.
- `next build` passa sem rede; saída `standalone` para a imagem Docker. `lint` e `typecheck` são agora scripts do `package.json` (`next lint` já não existe no Next 16).
- Por desenhar (não é bug): a página «Transições de Classe» faz 1 pedido de proposta por aluno e a API responde 409 enquanto a pauta não está fechada; a UI trata-o como «pendente».
