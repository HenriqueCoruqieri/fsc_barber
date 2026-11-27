# Autenticação

Regras implementadas na etapa 1 do login por credenciais. As demais (RN-AU-01, 03 e 07) entram quando a UI de cadastro e a action existirem.

| ID | Regra | Fonte |
|---|---|---|
| RN-AU-02 | O e-mail é normalizado (trim + lowercase) antes de validar e buscar no login. | `app/_lib/auth-schemas.ts:3-7`; `app/_lib/auth.ts:30-38` |
| RN-AU-04 | Login por senha com e-mail inexistente ou senha errada falha de forma genérica (`authorize` retorna `null`; mensagem "E-mail ou senha inválidos"). Usuário sem senha e sem conta Google também. | `app/_lib/auth.ts:40-54`; `app/_constants/auth.ts:6` |
| RN-AU-05 | Login por senha numa conta Google (sem senha e com `Account` `google`) é bloqueado com o código `GOOGLE_ACCOUNT` ("Esta conta usa o login com Google. Entre com o Google."). | `app/_lib/auth.ts:45-48`; `app/_constants/auth.ts:2,7` |
| RN-AU-06 | Login Google com e-mail que já tem cadastro com senha (e sem conta Google) é bloqueado: o callback `signIn` redireciona para `/?authError=google-conflict`. O aviso na home vem na etapa de UI. | `app/_lib/auth.ts:66-87`; `app/_constants/auth.ts:3,12-13` |
| RN-AU-08 | A senha só é guardada como hash bcrypt (custo 10) e nunca sai do servidor: o Prisma a omite em toda query; só o `authorize` a lê. | `app/_lib/prisma.ts:3-4`; `app/_lib/auth.ts:35-39`; `prisma/schema.prisma:46` |
| RN-AU-09 | A sessão é JWT (padrão do NextAuth: 30 dias); `session.user.id` vem de `token.sub`. | `app/_lib/auth.ts:17,89-95` |

## Observações
- Sem verificação de e-mail, recuperação de senha nem rate limit (risco aceito; ADR [0008](../decisions/0008-credentials-login-with-bcryptjs.md)).
