# Guia de Testes — Escola no Plano Essencial

> **Escola de Teste:** Colégio Esperança do Saber  
> **NIF:** `5000000001`  
> **Plano Subscrito:** **Essencial** (Ativo)  
> **Ciclo de Facturação:** 20.000,00 Kz/mês (ou 200.000,00 Kz/ano com 2 meses grátis)  
> **Quota de Armazenamento:** 5 GB (5.120 MB)  
> **Palavra-passe Universal para Testes:** `TestesEscola2026!`

---

## 1. Tabela de Credenciais & Roles

Todos os utilizadores abaixo foram criados na base de dados com a palavra-passe `TestesEscola2026!`.

| Papel (Role) | Nome do Utilizador | E-mail de Acesso | Funcionalidade Principal |
| :--- | :--- | :--- | :--- |
| **Titular** (`titular`) | Dr. Manuel Bento | `titular.essencial@mindschool.ao` | Gestão executiva da escola, subscrições e planos |
| **Direcção Pedagógica** (`direccao_pedagogica`) | Prof.ª Ana Paula Silva | `pedagogico.essencial@mindschool.ao` | Calendário escolar, turmas, pautas e notas |
| **Secretaria** (`secretaria`) | Teresa de Jesus | `secretaria.essencial@mindschool.ao` | Matrículas, estudantes, encarregados e cadastros |
| **Financeiro** (`financeiro`) | Carlos Gaspar | `financeiro.essencial@mindschool.ao` | Facturação de propinas, pagamentos e multas |
| **Professor** (`professor`) | Prof. João Fernandes | `professor.essencial@mindschool.ao` | Lançamento de notas, faltas e diário de turma |
| **Encarregado** (`encarregado`) | António da Silva | `encarregado.essencial@mindschool.ao` | Portal da Família: notas e propinas do educando |
| **Aluno** (`aluno`) | Mateus Silva | `aluno.essencial@mindschool.ao` | Portal do Aluno: horário escolar e boletim |

---

## 2. Limites e Capacidades Contratadas

- **Estudantes:** até **300** alunos
- **Turmas:** até **20** turmas
- **Professores:** até **30** professores
- **Utilizadores Internos:** até **15** utilizadores
- **Exportações Mensais:** até **20** exportações
- **Anos Lectivos Activos:** **1** ano lectivo
- **Armazenamento:** **5 GB**
- **Portal do Aluno e Encarregado:** **Incluído** ✅

---

## 3. Roteiro de Testes: Fluxos Permitidos (O que DEVE funcionar)

### Fluxo 1.1: Login Executivo e Verificação do Plano
1. Aceda ao frontend em `http://localhost:3000/login` (ou a porta local do frontend).
2. Introduza as credenciais:
   - **E-mail:** `titular.essencial@mindschool.ao`
   - **Palavra-passe:** `TestesEscola2026!`
3. Após login com sucesso, navegue para **Configurações / Planos** (`/plans`).
4. **Resultado Esperado:**
   - O plano atual deve ser exibido como **Essencial**.
   - O catálogo de planos exibe os novos preços: Essencial a **20.000,00 Kz/mês** e **200.000,00 Kz/ano**.
   - Os ciclos disponíveis para contratação são Mensal, Semestral e Anual (sem ciclo trimestral).
   - WhatsApp e SMS não constam dos add-ons disponíveis.

### Fluxo 1.2: Gestão Académica Básica (Secretaria)
1. Termine sessão e inicie com `secretaria.essencial@mindschool.ao` / `TestesEscola2026!`.
2. Aceda a **Alunos** (`/students`) e **Matrículas** (`/enrollments`).
3. Verifique o estudante pré-cadastrado **Mateus Silva** matriculado na **7.ª Classe - Turma A**.
4. Teste cadastrar um novo aluno ou matricular.
5. **Resultado Esperado:** O cadastro de alunos e matrículas funciona sem bloqueios dentro da quota de 300 estudantes.

### Fluxo 1.3: Gestão Financeira Padrão (Financeiro)
1. Inicie sessão com `financeiro.essencial@mindschool.ao` / `TestesEscola2026!`.
2. Aceda ao módulo de **Propinas & Finanças** (`/tuition` ou `/payments`).
3. Verifique a emissão de faturas e registo de pagamento de propina normal.
4. **Resultado Esperado:** Emissão e liquidação de propinas normais funcionam perfeitamente.

### Fluxo 1.4: Portal da Família e Portal do Estudante (CONFIRMAÇÃO DO PORTAL NO ESSENCIAL)
1. Inicie sessão com `encarregado.essencial@mindschool.ao` / `TestesEscola2026!`.
2. O sistema deve redirecionar para o **Portal da Família** (`/portal` ou `/dashboard`).
3. O encarregado **António da Silva** deve visualizar os dados escolares do aluno **Mateus Silva** (notas e estado das propinas).
4. Termine sessão e inicie com o aluno `aluno.essencial@mindschool.ao` / `TestesEscola2026!`.
5. **Resultado Esperado:** **Acesso permitido sem bloqueio de plano.** O portal está agora totalmente incluído no Plano Essencial.

---

## 4. Roteiro de Testes: Fluxos Bloqueados / Up-Sell (Gated Features)

O Plano Essencial não possui as funcionalidades avançadas dos escalões superiores. Ao tentar aceder a estas funcionalidades, o sistema deve restringir o acesso ou apresentar mensagem amigável de upgrade para o **Plano Profissional** ou **Enterprise**.

### Teste de Bloqueio 2.1: Gestão de Salas
1. Com a conta `pedagogico.essencial@mindschool.ao` ou `titular.essencial@mindschool.ao`:
2. Tente aceder à rota de Salas (`/rooms`).
3. **Resultado Esperado:** O menu de salas não deve aparecer ou, caso aceda via URL, a API/Frontend devolve restrição de plano (`ENTITLEMENT_REQUIRED`: *"Gestao de salas disponivel no plano Profissional"*).

### Teste de Bloqueio 2.2: Aulas, Substituições e Sumários
1. Tente aceder ao módulo de Aulas e Sumários (`/lessons`).
2. **Resultado Esperado:** Funcionalidade bloqueada com aviso de necessidade do plano Profissional (`lessons_summaries`).

### Teste de Bloqueio 2.3: Cobrança Automatizada por E-mail
1. Com a conta `financeiro.essencial@mindschool.ao`:
2. Aceda a Cobrança por E-mail (`/tuition/collections`).
3. **Resultado Esperado:** O ecrã bloqueia a operação de envio automatizado de lembretes, informando que a cobrança por e-mail requer o plano Profissional/Enterprise ou add-on específico.

### Teste de Bloqueio 2.4: Assiduidade Docente e Alerta de Risco
1. Com a conta `pedagogico.essencial@mindschool.ao`:
2. Tente aceder a `/teachers-attendance` ou `/dropout-risk`.
3. **Resultado Esperado:** Restrição visual no menu ou redirecionamento/bloqueio porque o plano actual (`Base`/Essencial) não atinge o nível mínimo exigido (`Smart`/Profissional).

### Teste de Armazenamento e Quotas 2.5: Upload de Ficheiros e Auditoria de Quota
1. Aceda ao módulo de Admissões (`/admissions`) ou Matrículas (`/enrollments`).
2. Submeta uma candidatura com Foto Tipo Passe e Cópia do BI (cada ficheiro limitado a 1.000 KB).
3. **Auditoria de Armazenamento via CLI:**
   - Execute no terminal da API (`mindschool-api`): `pnpm storage:calc`
   - O comando lista todas as escolas, plano activo, limite em MB, consumo real em bytes/MB e percentagem utilizada.
4. **Bloqueio Automático ao Atingir o Limite:**
   - Quando o armazenamento atinge a quota (ex.: 5 GB / 5.120 MB no plano Essencial), qualquer novo upload é bloqueado pela API com `QUOTA_EXCEEDED`.
   - O frontend apresenta a mensagem amigável: *"O limite de armazenamento de ficheiros do plano da sua escola foi atingido. O upload de novos documentos foi bloqueado."*

---

## 5. Resumo da Verificação

| Funcionalidade | Estado no Essencial | Validação |
| :--- | :--- | :--- |
| **Portal do Aluno e Encarregado** | **Liberado** | Login de aluno e encarregado com acesso aos dados |
| **Matrículas e Gestão de Turmas** | **Liberado** | Até 300 alunos e 20 turmas |
| **Armazenamento de Ficheiros** | **Liberado (até 5 GB)** | Upload seguro de fotos/docs com auditoria via `pnpm storage:calc` e bloqueio automático |
| **Gestão Financeira Básica** | **Liberado** | Propinas e pagamentos manuais |
| **Salas de Aula** | **Bloqueado** | Exige Plano Profissional |
| **Sumários e Substituições** | **Bloqueado** | Exige Plano Profissional |
| **Cobrança por E-mail** | **Bloqueado** | Exige Plano Profissional / Enterprise |
| **Provas Online** | **Bloqueado** | Exige Plano Enterprise |

