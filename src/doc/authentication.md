# Documentação de autenticação - Mindgest

Este documento descreve o fluxo de autenticação e gestão de sessões no Mindgest Frontend, detalhando os ficheiros e a lógica aplicada.

## 1. Visão Geral
A autenticação utiliza **JWT (JSON Web Tokens)** e o gerenciamento de sessão é feito através de **Cookies HTTP-only**. Isso garante que os tokens não fiquem expostos ao JavaScript do lado do cliente, protegendo a aplicação contra ataques XSS.

---

## 2. Fluxos Principais

### Login
O processo de entrada valida as credenciais e estabelece a sessão do usuário.
- **Arquivos relacionados:**
  - `src/actions/login.ts`: Contém a Server Action `loginAction` que processa o login.
  - `src/lib/session.ts`: Define a função `createSession` que armazena os tokens nos cookies.
- **Fluxo:**
  1. O formulário de login chama a `loginAction`.
  2. Após a validação na API, os tokens e os dados do usuário são retornados.
  3. A sessão é criada salvando o `accessToken`, `refreshToken` e o `role` nos cookies.

### Registro (Register)
A criação de novas contas é processada através do cadastro de uma empresa.
- **Arquivos relacionados:**
  - `src/components/auth/register/steps/steps.tsx`: Componente principal do formulário multi-etapas.
  - `src/hooks/company/use-create-company.ts`: Hook `useAddCompany` que gerencia a mutação de criação.
  - `src/services/company-service.ts`: Serviço que realiza a chamada de criação da empresa/usuário.
- **Fluxo:**
  1. O usuário preenche os dados da empresa e do administrador no Stepper.
  2. O hook `useAddCompany` envia os dados consolidados.
  3. No sucesso, uma modal de confirmação é exibida ao usuário.

### Esqueci a Senha (Forgot Password)
Inicia o processo de recuperação de conta.
- **Arquivos relacionados:**
  - `src/services/auth-service.ts`: Contém o método `forgotPassword`.
  - `src/components/auth/forgot-password/`: Componentes da interface de solicitação.
- **Fluxo:**
  1. O e-mail do usuário é enviado via `authService.forgotPassword`.
  2. O sistema solicita à API o envio do token de recuperação para o e-mail informado.

### Redefinição de Senha (Reset Password)
Conclui a alteração da senha utilizando um token de validação.
- **Arquivos relacionados:**
  - `src/services/auth-service.ts`: Contém o método `resetPassword`.
  - `src/app/auth/reset-password/page.tsx`: Página que captura o token da URL e exibe o formulário.
- **Fluxo:**
  1. O usuário submete a nova senha junto com o token recebido.
  2. O serviço `resetPassword` valida a operação.

---

## 3. Gestão de Tokens e Cookies

### Cookies de Sessão
Os cookies são configurados com segurança máxima (`httpOnly`, `secure`, `sameSite: "lax"`).
- **Arquivos relacionados:**
  - `src/lib/session.ts`: Lógica de criação, leitura e destruição de cookies.
  - `src/constants/auth.ts`: Define as chaves dos cookies (`mindgest.access_token`, `mindgest.refresh_token`, `mindgest.role`).

### Refresh Token (Renovação Automática)
A renovação do acesso ocorre de forma transparente sem interromper a navegação do usuário.
- **Arquivos relacionados:**
  - `src/services/api.ts`: Configuração do interceptor do Axios para capturar erros 401.
  - `src/app/api/auth/refresh/route.ts`: Rota de API interna do Next.js que faz a ponte com a API externa para renovar o token usando o cookie de refresh.
- **Fluxo:**
  1. Se uma requisição falha com erro **401 (Unauthorized)**, o interceptor entra em ação.
  2. É feita uma chamada para a rota interna `/api/auth/refresh`.
  3. Esta rota lê o `refreshToken` do cookie, obtém um novo par de tokens e atualiza os cookies via `createSession`.
  4. A requisição original que falhou é repetida com o novo token.

---

## 4. Logout
Finaliza a sessão do usuário e limpa os dados locais.
- **Arquivos relacionados:**
  - `src/actions/login.ts`: Contém a `logoutAction`.
  - `src/lib/session.ts`: Função `destroySession` que remove os cookies.
- **Lógica:**
  1. A sessão local é destruída removendo os cookies de acesso e refresh.
  2. O cache do token no cliente é resetado e o usuário é redirecionado para a tela de login.
