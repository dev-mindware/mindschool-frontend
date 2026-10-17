# Guia de Testes — Escola no Plano Profissional

> **Escola de Teste:** Instituto Politécnico Vanguard  
> **NIF:** `5000000002`  
> **Plano Subscrito:** **Profissional** (Ativo)  
> **Ciclo de Facturação:** 49.900,00 Kz/mês (ou 499.000,00 Kz/ano com 2 meses grátis / 16,67% de desconto)  
> **Quota de Armazenamento:** 25 GB (25.600 MB)  
> **Palavra-passe Universal para Testes:** `TestesEscola2026!`

---

## 1. Tabela de Credenciais & Roles

Todos os utilizadores abaixo foram criados na base de dados com a palavra-passe `TestesEscola2026!`.

| Papel (Role) | Nome do Utilizador | E-mail de Acesso | Funcionalidade Principal |
| :--- | :--- | :--- | :--- |
| **Titular** (`titular`) | Dr. Arnaldo Pires | `titular.pro@mindschool.ao` | Gestão executiva da escola, subscrições e planos |
| **Direcção Pedagógica** (`direccao_pedagogica`) | Prof. Fernando Varela | `pedagogico.pro@mindschool.ao` | Horários, salas, assiduidade docente e relatórios |
| **Secretaria** (`secretaria`) | Marta Conceição | `secretaria.pro@mindschool.ao` | Matrículas, estudantes, turmas e documentos |
| **Financeiro** (`financeiro`) | Rui Daniel | `financeiro.pro@mindschool.ao` | Facturação, gestão de atrasos e cobrança |
| **Professor** (`professor`) | Prof.ª Beatriz Morais | `professor.pro@mindschool.ao` | Sumários de aulas, diário docente e notas |
| **Encarregado** (`encarregado`) | Sebastião Neto | `encarregado.pro@mindschool.ao` | Portal da Família: notas, faltas e propinas |
| **Aluno** (`aluno`) | Leandro Neto | `aluno.pro@mindschool.ao` | Portal do Aluno: aulas, horário e avaliações |

---

## 2. Limites e Capacidades Contratadas

- **Estudantes:** até **1.500** alunos
- **Turmas:** até **100** turmas
- **Professores:** até **150** professores
- **Utilizadores Internos:** até **50** utilizadores
- **Exportações Mensais:** até **100** exportações
- **Anos Lectivos Activos:** até **3** anos lectivos simultâneos
- **Armazenamento:** **25 GB**
- **Funcionalidades Avançadas Incluídas:**
  - Gestão de Salas e Conflitos (`rooms`) ✅
  - Aulas, Substituições e Sumários (`lessons_summaries`) ✅
  - Assiduidade Docente com QR Code (`teachers-attendance`) ✅
  - Alerta Preditivo de Risco de Abandono (`dropout-risk`) ✅
  - Dashboard Avançado & Relatórios Analíticos (`reports_advanced`) ✅
  - Calendário Geral & Integração Google Calendar (`google_calendar`) ✅
  - Portal do Professor Completo (`portal_teacher_full`) ✅
  - Portal do Aluno e Encarregado (`portal`) ✅

---

## 3. Roteiro de Testes: Fluxos Permitidos no Plano Profissional

### Fluxo 1.1: Validação do Plano e Facturação
1. Aceda ao frontend e inicie sessão com:
   - **E-mail:** `titular.pro@mindschool.ao`
   - **Palavra-passe:** `TestesEscola2026!`
2. Navegue para **Configurações / Planos** (`/plans`).
3. **Resultado Esperado:**
   - O plano activo é identificado como **Profissional** (`Smart`).
   - Os valores de renovação reflectem o preço correcto: **49.900,00 Kz/mês** e opção anual a **499.000,00 Kz** (com destaque para a poupança de 2 meses).

### Fluxo 1.2: Gestão de Salas de Aula (Diferencial vs Essencial)
1. Inicie sessão com `pedagogico.pro@mindschool.ao` / `TestesEscola2026!`.
2. Aceda ao módulo de Gestão de Salas (`/rooms`).
3. Verifique a sala pré-criada na seed: **Sala 101 - Laboratório de Informática** (`SALA-101`).
4. Crie uma nova sala (ex.: `SALA-102`, Capacidade: 35).
5. **Resultado Esperado:** **Acesso e criação autorizados sem qualquer bloqueio.** A gestão de salas está activa e funcional no Plano Profissional.

### Fluxo 1.3: Aulas, Sumários e Substituições
1. Inicie sessão com a professora `professor.pro@mindschool.ao` / `TestesEscola2026!`.
2. Aceda ao módulo de **Aulas & Sumários** (`/lessons` ou diário de turma).
3. Seleccione a **7.ª Classe - Turma A** e registe um sumário de aula para Língua Portuguesa.
4. **Resultado Esperado:** O registo de sumário, presenças e ocorrências é guardado com sucesso.

### Fluxo 1.4: Assiduidade Docente e Alerta de Risco
1. Com a conta `pedagogico.pro@mindschool.ao`:
2. Aceda a **Assiduidade Docente** (`/teachers-attendance`). O ecrã de leitura de presença ou registo de ponto deve abrir sem restrições.
3. Aceda a **Alerta de Risco** (`/dropout-risk`).
4. **Resultado Esperado:** O módulo de análise de risco e assiduidade docente carrega normalmente (está autorizado para o nível `Smart`/Profissional).

### Fluxo 1.5: Portal da Família e Portal do Estudante
1. Inicie sessão com `encarregado.pro@mindschool.ao` / `TestesEscola2026!`.
2. Verifique os dados do estudante **Leandro Neto**.
3. **Resultado Esperado:** Portal acessível com histórico académico e financeiro.

---

## 4. Roteiro de Testes: Fluxos Bloqueados / Up-Sell para Enterprise

O Plano Profissional oferece vasta autonomia operacional, mas mantém salvaguardas e limites face ao topo de gama **Enterprise**.

### Teste de Bloqueio 2.1: Multi-Escola (Gestão de Múltiplos Polos/Campi)
1. Com a conta executiva `titular.pro@mindschool.ao`:
2. Tente aceder ao relatório ou módulo Multi-Escola (`/reports/multi-school`).
3. **Resultado Esperado:** O acesso é bloqueado ou o sistema indica que a funcionalidade Multi-Escola requer o plano **Enterprise** (`Pro`).

### Teste de Bloqueio 2.2: Gerador Automático de Horários com IA/Solver
1. Tente aceder ao resolvedor automático de horários escolares (`timetable_solver`).
2. **Resultado Esperado:** O sistema informa que a optimização algorítmica de horários sem conflitos é um recurso reservado ao plano **Enterprise**.

### Teste de Bloqueio 2.3: Quota de Armazenamento e Limite de Quotas
1. Na API ou nas estatísticas de subscrição, consulte os limites actuais:
2. **Resultado Esperado:**
   - Armazenamento com limite de **25 GB** (em vez dos **50 GB** do Enterprise).
   - Limite máximo de **1.500 alunos** e **100 turmas** (no Enterprise são ilimitados).

---

## 5. Resumo da Verificação

| Funcionalidade | Estado no Profissional | Validação |
| :--- | :--- | :--- |
| **Portal do Aluno e Encarregado** | **Liberado** | Acesso garantido |
| **Gestão de Salas (`rooms`)** | **Liberado** | Criação e gestão de espaços escolares |
| **Sumários e Aulas (`lessons`)** | **Liberado** | Registo diário pelo corpo docente |
| **Assiduidade Docente (QR Code)** | **Liberado** | Controlo de assiduidade dos professores |
| **Alerta de Risco de Abandono** | **Liberado** | Relatórios analíticos de risco |
| **Capacidade Operacional** | **1.500 alunos / 25 GB** | Quota ampla para médias/grandes escolas |
| **Multi-Escola & Redes de Ensino** | **Bloqueado** | Exige Plano Enterprise |
| **Gerador Automático de Horários** | **Bloqueado** | Exige Plano Enterprise |
| **Armazenamento 50 GB** | **Bloqueado** | Exige Plano Enterprise |
