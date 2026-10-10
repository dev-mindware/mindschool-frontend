# Plano — Sidebar modular (rail de módulos + painel de menus)

Estado em 2026-10-09. Plano aprovado e implementado nas fases 0–3, 4 (breadcrumb derivado) e 5 (telemóvel, Ctrl+B); ver «Implementação».

## Implementação

- **Regras (revisão de 2026-10-09):** no máximo 8 páginas por módulo; «Início» mostra só a dashboard do papel (sem listar todas as páginas); o rail e o painel seguem o desenho de referência (tile do rail, título do módulo, secções separadas com rótulo cinzento e ícones); todo o papel tem «Configurações» (a página `DefSetup`, abas por papel, com «Perfil» novo) e, nas sidebars modulares, é o último módulo e só tem essa página. Encarregado e aluno trocaram «O meu perfil» por Configurações (grupo «Conta»).
- Módulos da escola: Início · Secretaria (Alunos & Matrículas, Documentos Oficiais) · Académico · Avaliação (+ Provas, Risco) · Vida Escolar (biblioteca, saúde, transporte, actividades, comunicação) · Financeiro (+ Subscrição) · Relatórios · Plataforma (só admin) · Configurações.
- `constants/navigation.ts`: estrutura declarativa módulo → secção → páginas, limiares (`DUAL_MIN_MODULES=3`, `DUAL_MIN_PAGES=15`, `MAX_PAGES_PER_MODULE=8`), `buildNavigation`, `activeModule`, `deriveBreadcrumb`. Mantém `menu-items.tsx` como fonte dos itens (papéis/planos); testes falham se uma página não tiver lugar na estrutura, se um módulo passar de 8 ou se um papel ficar sem Configurações.
- `hooks/common/use-navigation.ts`; `global-sidebar/modular-sidebar.tsx` (rail + painel, colapso, trocador de módulo, chips no telemóvel) e `grouped-nav.tsx` (encarregado/aluno). `AppSidebar` escolhe o modo; `ui/sidebar.tsx` ganhou a prop `width`.
- `PageWrapper` deriva o breadcrumb (`Módulo › Secção › Página`); `routeLabel`/`subRoute` só valem para páginas fora do registo ou como detalhe; etiquetas iguais nunca se repetem.
- Testes: `tests/unit/navigation.test.ts` (modo por papel, módulos, breadcrumb).
- Por fazer: remover `routeLabel`/`subRoute` redundantes dos ~59 `PageWrapper` (inofensivos), contadores nos itens e pesquisa Ctrl+K, validação em telemóvel.

## 1. Situação actual

- `components/templates/global-sidebar` usa o `Sidebar` do shadcn (`collapsible="icon"`) com **uma única coluna** e acordeões (`NavMenu`). Fonte dos menus: `constants/menu-items.tsx` (25 itens de topo, 3 níveis de leitura: item → sub-item).
- Páginas por papel (medido no código):

| Papel | Itens de topo | Páginas |
|---|---|---|
| Director-geral, Titular (OWNER), Admin | 13 | 42 |
| Gestor (MANAGER) | 12 | 37 |
| Director pedagógico | 11 | 33 |
| Secretaria | 10 | 30 |
| Professor | 6 | 17 |
| Financeiro | 5 | 11 |
| Encarregado / Aluno | 11 (todos planos) | 11 |
| Admin de sistema | 4 | 6 |
| Auditor MED | 3 | 4 |

- Breadcrumb: `PageWrapper` recebe `routeLabel` + `subRoute` escritos à mão em ~59 páginas; em 10 deles são iguais, daí «Financeiro › Financeiro». Os restantes repetem o nome do grupo do menu à mão (risco de ficarem desactualizados).
- Colapsar: o `SidebarTrigger` encolhe a coluna para ícones (4 rem), mas não existe rail de módulos.

## 2. O que dizem as referências

- Padrão «rail + painel» (dual sidebar): coluna estreita só com ícones de secções e painel largo com os menus da secção activa; indicado para apps com muitas secções (IDEs, ferramentas de design, dashboards empresariais) — [shadcn sidebar-09 / blocos de dual-column](https://www.shadcn.io/blocks/sidebar-dual-column), [Application Shell 12](https://www.shadcnblocks.com/block/application-shell12).
- Boas práticas de navegação lateral: usar a sidebar com 5 ou mais itens; manter 5–9 categorias de topo e no máximo 2–3 níveis; rótulos curtos e na linguagem do utilizador — [SAP Side Navigation](https://www.sap.com/design-system/cx-ux-best-practice-guide/components/side-navigation/general), [SaaS navigation UX patterns](https://www.saasui.design/blog/saas-navigation-ux-patterns). A SAP define três estados (invisível, estreito, largo), o que bate com o comportamento pedido.
- No exemplo do shadcn, ao colapsar o que desaparece é o painel e o rail fica; **o pedido é o contrário** (ao colapsar some o rail e fica a coluna de menus só com ícones, como na 3.ª imagem). Isto obriga a um desenho próprio (secção 4.3).

## 3. Decisões de desenho (recomendadas)

1. **Modo dinâmico por papel** (uma função pura, testável): `dual` quando o utilizador vê **≥ 3 módulos e ≥ 15 páginas**; caso contrário `flat` (uma coluna, sem rail). Limiares em constantes.
   - `dual`: Director-geral, Titular, Admin, Gestor, Director pedagógico, Secretaria.
   - `flat`: Professor (17 páginas, só 2 módulos), Financeiro, Admin de sistema, Auditor MED.
   - `flat` agrupada: Encarregado e Aluno (11 páginas) passam a ter 3 rótulos de secção em vez de 11 itens soltos: **Acompanhamento** (Início, Aproveitamento, Horário, Calendário, Disciplinas, Provas Online), **Serviços** (Financeiro, Biblioteca, Documentos e Pedidos, Comunicados), **Conta** (O meu perfil).
2. **Módulos** (rail): agrupam os itens de topo actuais; os grupos antigos passam a **rótulos de secção** dentro do painel (como «Status / Group» na 1.ª imagem), eliminando os acordeões.

| Módulo (ícone) | Secções / itens |
|---|---|
| Início | Dashboard (link directo, sem painel) |
| Secretaria | Alunos & Matrículas, Documentos Oficiais, Comunicação & Circulares |
| Académico | Gestão Académica, Avaliações & Pautas, Provas Online, Alerta de Risco, Assiduidade Docente |
| Financeiro | Propinas & Finanças |
| Relatórios | Relatórios & MED |
| Administração | Planos, Plataforma, Configurações (rodapé do rail, ícone de engrenagem como na imagem) |

   Módulos sem itens para o papel desaparecem; um módulo com uma única página vira link directo no rail (sem painel).
3. **Fonte única de navegação**: novo `constants/navigation.ts` (módulos → secções → itens, com `roles`, `minPlan`, `feature`, `icon`) que substitui `menu-items.tsx`; o filtro `getSidebarForUser` continua a decidir o que o utilizador vê. O mesmo registo alimenta a sidebar, o breadcrumb e a pesquisa de menu.

## 4. Comportamento

### 4.1 Expandida (modo `dual`)
Rail de 3,5 rem (logótipo no topo, módulos, engrenagem e avatar no fundo) + painel de 15 rem com o título do módulo, secções e itens. O módulo activo vem da URL (correspondência do prefixo mais longo); ao navegar para uma página de outro módulo o rail acompanha. Clicar num módulo abre a sua primeira página (ou a última visitada nesse módulo, guardada em `localStorage`).

### 4.2 Modo `flat`
Mantém a coluna única actual (agora com rótulos de secção em vez de acordeões, quando fizer sentido) e **não renderiza o rail**.

### 4.3 Colapsada (pedido principal)
Ao carregar no `SidebarTrigger` (ou Ctrl+B) o **rail desaparece** e fica só uma coluna de 4 rem com os **ícones das páginas do módulo activo** (3.ª imagem), com tooltip. Não há botão de troca de módulo na versão colapsada (decisão de 2026-10-09): para mudar de módulo expande-se a sidebar. Nas páginas de módulos de uma só página (Dashboard, Configurações) o colapso fica **desactivado** (botão e Ctrl+B; `collapseLocked` no contexto da sidebar) e o rail aparece sempre. Ao expandir volta o rail+painel. Implementação: sidebar exterior `collapsible="icon"`; o rail usa `group-data-[collapsible=icon]:hidden` e a largura expandida do modo `dual` é `3,5 rem + 15 rem` definida só nesse modo (`--sidebar-width`), mantendo os 4 rem do modo ícone.

### 4.4 Telemóvel
Gaveta (`Sheet`) com uma fila horizontal de módulos no topo (chips com ícone) e a lista do módulo por baixo; sem rail lateral.

### 4.5 Extras de organização (baratos, alto valor)
- Contadores nos itens (como o «4 / 5 / 2» da 1.ª imagem): comprovativos por validar, pedidos por tratar, alertas abertos, a partir de endpoints que já existem.
- Pesquisa de páginas (Ctrl+K) usando o mesmo registo; útil com 42 páginas.

## 5. Breadcrumb

- Passa a ser **derivado**: `Módulo › Secção › Página` a partir de `navigation.ts` e da URL; `PageWrapper` deixa de exigir `routeLabel`/`subRoute`.
- Regra de deduplicação: nunca repetir etiquetas consecutivas iguais (corrige já «Financeiro › Financeiro»); se o módulo só tem uma página, mostra só a página.
- Páginas de detalhe acrescentam um segmento (`detail="Realizar prova"`) ou passam `segments` (já suportado).
- Props antigas ficam como *override* durante a migração; depois removem-se dos ~59 `PageWrapper`.

## 6. Fases

| Fase | Entrega | Esforço |
|---|---|---|
| 0 | Correcção rápida: deduplicar etiquetas consecutivas iguais no `DinamicBreadcrumb` | 0,5 h |
| 1 | `navigation.ts` (módulos/secções) + testes por papel (módulos, nº de páginas, modo) | 1 dia |
| 2 | `ModularSidebar`: rail + painel, escolha `dual`/`flat`, módulo activo pela URL | 1–2 dias |
| 3 | Colapso (rail some, ícones do módulo activo), botão de módulos, persistência | 1 dia |
| 4 | Breadcrumb derivado e limpeza dos `PageWrapper` | 1 dia |
| 5 | Telemóvel, acessibilidade (roving tabindex, `aria-current`, foco), Ctrl+B/Ctrl+K, contadores | 1–2 dias |
| 6 | Activação por papel (flag) e remoção do `NavMenu` antigo | 0,5 dia |

Total estimado: 6–8 dias úteis; as fases 0–1 já resolvem o breadcrumb e fixam o modelo de dados.

## 7. Testes e verificação

- Unitários (Jest): `getSidebarMode(role)`, módulos visíveis por papel, módulo activo por URL, derivação do breadcrumb, deduplicação.
- Visual (Browser/Playwright) por papel: director (dual), professor e financeiro (flat), encarregado (flat agrupada); expandir/colapsar; 375 px.
- Regressão: `tsc`, lint (já a funcionar), `jest`.

## 8. Riscos

- Largura do conteúdo: o modo `dual` ocupa 18,5 rem; mitigado pelo colapso e por o `SidebarInset` já ser fluido.
- Papéis a meio do limiar (Professor com 17 páginas): se se quiser `dual` para ele, baixar o limiar de módulos para 2; é só uma constante.
- Consistência: itens novos têm de ser registados em `navigation.ts` (fica um teste que falha se uma rota privada não estiver no registo).

## 9. Decisões que preciso de si

1. A divisão em módulos da secção 3 está certa (nomes e agrupamento)? Em particular, «Comunicação» na Secretaria e «Documentos Oficiais» na Secretaria.
2. Limiar de `dual` (≥ 3 módulos e ≥ 15 páginas) está bem? Quer o Professor também em `dual`?
3. Na sidebar colapsada, o botão de módulos no topo (popover) serve, ou prefere outra forma de trocar de módulo?
4. Encarregado/Aluno: aceita as 3 secções rotuladas (Acompanhamento, Serviços, Conta) em coluna única?
