# Guia de Testes — Escola no Plano Enterprise

> **Escola de Teste:** Complexo Escolar Internacional Horizonte  
> **NIF:** `5000000003`  
> **Plano Subscrito:** **Enterprise** (Ativo)  
> **Ciclo de Facturação:** 99.900,00 Kz/mês (ou 999.000,00 Kz/ano com 2 meses grátis / 16,67% de desconto)  
> **Quota de Armazenamento:** **50 GB** (51.200 MB)  
> **Palavra-passe Universal para Testes:** `TestesEscola2026!`

---

## 1. Tabela de Credenciais & Roles

Todos os utilizadores abaixo foram criados na base de dados com a palavra-passe `TestesEscola2026!`.

| Papel (Role) | Nome do Utilizador | E-mail de Acesso | Funcionalidade Principal |
| :--- | :--- | :--- | :--- |
| **Titular** (`titular`) | Dr. Eduardo Van-Dúnem | `titular.enterprise@mindschool.ao` | Gestão executiva máxima, múltiplos polos e auditoria |
| **Direcção Pedagógica** (`direccao_pedagogica`) | Prof.ª Graça Chissingui | `pedagogico.enterprise@mindschool.ao` | Horários automáticos, exames, pautas e salas |
| **Secretaria** (`secretaria`) | Suzana Leitão | `secretaria.enterprise@mindschool.ao` | Arquivo digital, matrículas em escala e documentação |
| **Financeiro** (`financeiro`) | Valdemar Costa | `financeiro.enterprise@mindschool.ao` | Cobrança por e-mail, reconciliação e tesouraria |
| **Professor** (`professor`) | Prof. Nelson Galiano | `professor.enterprise@mindschool.ao` | Provas online, sumários, notas e material didático |
| **Encarregado** (`encarregado`) | Dr. Domingos Kassoma | `encarregado.enterprise@mindschool.ao` | Portal Premium da Família com acompanhamento total |
| **Aluno** (`aluno`) | Yara Kassoma | `aluno.enterprise@mindschool.ao` | Portal do Aluno com acesso a exames e biblioteca |

---

## 2. Limites e Capacidades Contratadas

- **Estudantes:** **Ilimitados** (sem barreira de quota)
- **Turmas:** **Ilimitadas**
- **Professores:** **Ilimitados**
- **Utilizadores Internos:** **Ilimitados**
- **Exportações Mensais:** **Ilimitadas**
- **Anos Lectivos Activos:** **Ilimitados**
- **Armazenamento:** **50 GB** (51.200 MB) — capacidade máxima para arquivos digitais, documentos MED e anexos escolares
- **Funcionalidades Globais Incluídas:**
  - Todas as funcionalidades do Plano Profissional (Salas, Sumários, Assiduidade, Alertas) ✅
  - Multi-Escola & Gestão Centralizada de Polos (`multi_school`, `central_management`) ✅
  - Arquivo Documental Avançado (`archive_advanced`) ✅
  - Cobrança Automatizada e Notificações por E-mail (`email_collections`) ✅
  - Provas Online e Avaliação Digital (`exams_full`) ✅
  - Gerador Automático de Horários (`timetable_solver`) ✅
  - BI & Relatórios Executivos (`bi_analytics`) ✅
  - API & Integrações de Sistemas (`api_access`) ✅
  - Portal da Família e do Aluno Premium ✅
  - Suporte com SLA Dedicado (`sla_support`) ✅

---

## 3. Roteiro de Testes: Fluxos Completos no Plano Enterprise

### Fluxo 1.1: Validação de Escalão e Armazenamento (50 GB)
1. Aceda ao frontend e inicie sessão com:
   - **E-mail:** `titular.enterprise@mindschool.ao`
   - **Palavra-passe:** `TestesEscola2026!`
2. Navegue para **Configurações / Planos** (`/plans`).
3. **Resultado Esperado:**
   - O plano activo é identificado como **Enterprise** (`Pro` / escalão máximo).
   - O catálogo exibe a taxa mensal de **99.900,00 Kz/mês** e a modalidade anual a **999.000,00 Kz** (poupança anual de 199.800,00 Kz / 2 meses grátis).
   - A quota de armazenamento contratada reflecte exactamente **50 GB** (51.200 MB).
   - Não existem quotas numéricas limitativas para estudantes, turmas ou utilizadores.

### Fluxo 1.2: Acesso ao Módulo Multi-Escola
1. Com a conta `titular.enterprise@mindschool.ao`:
2. Aceda ao menu **Relatórios & MED / Multi-Escola** (`/reports/multi-school`).
3. **Resultado Esperado:** **O ecrã abre sem qualquer restrição de plano.** Em contraste com o Plano Essencial e Profissional, o Enterprise possui total autorização para operações consolidadas multi-escola.

### Fluxo 1.3: Provas Online e Exames Digitais
1. Inicie sessão com o professor `professor.enterprise@mindschool.ao` / `TestesEscola2026!`.
2. Aceda a **Provas Online** (`/online-exams`).
3. Teste a criação de uma prova digital com perguntas de escolha múltipla ou dissertativas.
4. **Resultado Esperado:** O módulo de provas online está completamente disponível e permite a publicação e gestão do exame.

### Fluxo 1.4: Cobrança e Notificações por E-mail
1. Inicie sessão com o responsável financeiro `financeiro.enterprise@mindschool.ao` / `TestesEscola2026!`.
2. Aceda a **Cobrança por E-mail** (`/tuition/collections`).
3. Teste a parametrização de modelos de e-mail e emissão de avisos de propinas.
4. **Resultado Esperado:** O envio e parametrização de cobrança por correio eletrónico funciona sem exigir add-on avulso, pois já vem incluído no Enterprise.

### Fluxo 1.5: Gestão de Salas & Auditório
1. Inicie sessão com `pedagogico.enterprise@mindschool.ao` / `TestesEscola2026!`.
2. Aceda a **Salas** (`/rooms`).
3. Verifique o espaço pré-criado na seed: **Auditório Central Horizonte** (`AUDITORIO-A`).
4. **Resultado Esperado:** Gestão de grandes espaços e salas sem restrições.

### Fluxo 1.6: Portal da Família e Portal do Estudante
1. Inicie sessão com `encarregado.enterprise@mindschool.ao` / `TestesEscola2026!`.
2. Verifique os dados da aluna **Yara Kassoma**.
3. Inicie sessão com `aluno.enterprise@mindschool.ao` / `TestesEscola2026!`.
4. **Resultado Esperado:** Acesso a todas as áreas do portal escolar com excelente experiência de utilização.

---

## 4. Matriz Comparativa de Capacidades dos 3 Planos

| Recurso / Funcionalidade | Plano Essencial | Plano Profissional | Plano Enterprise |
| :--- | :---: | :---: | :---: |
| **Mensalidade** | 20.000,00 Kz | 49.900,00 Kz | 99.900,00 Kz |
| **Anuidade (2 meses grátis)** | 200.000,00 Kz | 499.000,00 Kz | 999.000,00 Kz |
| **Limite de Alunos** | 300 | 1.500 | **Ilimitado** |
| **Limite de Turmas** | 20 | 100 | **Ilimitado** |
| **Limite de Professores** | 30 | 150 | **Ilimitado** |
| **Limite de Utilizadores** | 15 | 50 | **Ilimitado** |
| **Armazenamento em Nuvem** | 5 GB | 25 GB | **50 GB** |
| **Portal Aluno & Encarregado** | Incluído ✅ | Incluído ✅ | Incluído ✅ |
| **Gestão de Salas (`rooms`)** | ❌ Bloqueado | Incluído ✅ | Incluído ✅ |
| **Aulas & Sumários (`lessons`)** | ❌ Bloqueado | Incluído ✅ | Incluído ✅ |
| **Assiduidade Docente (QR)** | ❌ Bloqueado | Incluído ✅ | Incluído ✅ |
| **Alerta Risco de Abandono** | ❌ Bloqueado | Incluído ✅ | Incluído ✅ |
| **Cobrança por E-mail** | ❌ Bloqueado | Requer Add-on | Incluído ✅ |
| **Provas Online** | ❌ Bloqueado | ❌ Bloqueado | Incluído ✅ |
| **Multi-Escola & Redes** | ❌ Bloqueado | ❌ Bloqueado | Incluído ✅ |
| **Solver de Horários com IA** | ❌ Bloqueado | ❌ Bloqueado | Incluído ✅ |
| **BI & Analytics** | ❌ Bloqueado | ❌ Bloqueado | Incluído ✅ |
| **Acesso a APIs** | ❌ Bloqueado | ❌ Bloqueado | Incluído ✅ |
| **SLA de Suporte Dedicado** | Standard | Prioritário | Dedicado / 24/7 ✅ |

---

## 5. Procedimento de Restauro / Re-execução da Seed

Caso efectue testes destrutivos ou deseje reiniciar os dados padrão das 3 escolas:

```bash
cd mindschool-api
pnpm seed:commercial
```

O comando é totalmente idempotente: actualiza os dados existentes sem duplicar registos.
