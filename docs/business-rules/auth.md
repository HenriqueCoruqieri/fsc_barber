# Autenticação

Regras implementadas do login e do cadastro por credenciais.

| ID | Regra | Fonte |
|---|---|---|
| RN-AU-01 | Cadastro exige nome (2 a 50 após trim), e-mail válido, senha (8 a 72 caracteres e no máximo 72 bytes, com pelo menos 1 letra e 1 número) e confirmação igual (erro "As senhas não coincidem" no campo de confirmação). A validação roda no cliente (react-hook-form) e é refeita no servidor pela action `createUser` com o mesmo `signUpSchema`; entrada inválida devolve `{ error }` com a primeira mensagem do zod. | `app/_lib/auth-schemas.ts:12-21,36-62`; `app/_actions/create-user.ts:11-17`; `app/_components/sign-up-form.tsx:36-41,49` |
| RN-AU-02 | O e-mail é normalizado (trim + lowercase) antes de validar e buscar no login. | `app/_lib/auth-schemas.ts:6-10`; `app/_lib/auth.ts:30-38` |
| RN-AU-03 | O e-mail é único. Cadastro com e-mail que já pertence a uma conta Google é bloqueado com "Este e-mail já está vinculado a uma conta Google. Entre com o Google."; com qualquer outro e-mail existente, "Este e-mail já está cadastrado." (também quando uma corrida entre cadastros gera `P2002` no banco). O formulário mostra a mensagem no campo e-mail. | `app/_actions/create-user.ts:22-36,46-51`; `app/_constants/auth.ts:9-11`; `app/_components/sign-up-form.tsx:52-57` |
| RN-AU-04 | Login por senha com e-mail inexistente ou senha errada falha de forma genérica (`authorize` retorna `null`; mensagem "E-mail ou senha inválidos"). Usuário sem senha e sem conta Google também. | `app/_lib/auth.ts:40-54`; `app/_constants/auth.ts:7`; `app/_components/sign-in-form.tsx:52-57` |
| RN-AU-05 | Login por senha numa conta Google (sem senha e com `Account` `google`) é bloqueado com o código `GOOGLE_ACCOUNT` ("Esta conta usa o login com Google. Entre com o Google."). | `app/_lib/auth.ts:45-48`; `app/_constants/auth.ts:2,8`; `app/_components/sign-in-form.tsx:52-57` |
| RN-AU-06 | Login Google com e-mail que já tem cadastro com senha (e sem conta Google) é bloqueado: o callback `signIn` redireciona para `/?authError=google-conflict`. A home lê `searchParams` no servidor e mostra o aviso "Este e-mail já tem cadastro com senha..." (só para o código `google-conflict`; outros valores não renderizam nada). | `app/_lib/auth.ts:66-87`; `app/_constants/auth.ts:3,12-13`; `app/page.tsx:17-23,40`; `app/_components/auth-error-alert.tsx:9-22` |
| RN-AU-07 | Depois do cadastro bem-sucedido, o usuário entra automaticamente (`signIn("credentials")` com os mesmos dados, sem redirect): o dialog fecha, aparece "Conta criada com sucesso!" e a página é atualizada. Se esse login falhar, aparece "Conta criada, mas não foi possível entrar. Faça login." e o dialog volta para a aba Entrar. | `app/_components/sign-up-form.tsx:63-77` |
| RN-AU-08 | A senha só é guardada como hash bcrypt (custo 10) e nunca sai do servidor: o Prisma a omite em toda query; só o `authorize` a lê. | `app/_lib/prisma.ts:3-4`; `app/_actions/create-user.ts:38-42`; `app/_lib/auth.ts:35-39`; `prisma/schema.prisma:46` |
| RN-AU-09 | A sessão é JWT (padrão do NextAuth: 30 dias); `session.user.id` vem de `token.sub`. | `app/_lib/auth.ts:17,89-95` |

## Observações
- Sem verificação de e-mail, recuperação de senha nem rate limit (risco aceito; ADR [0008](../decisions/0008-credentials-login-with-bcryptjs.md)).
