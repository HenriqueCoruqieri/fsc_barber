# 0008 — Login por credenciais com bcryptjs

- Status: aceita
- Data: 2026-11-26

## Contexto

O app só tinha login com Google. Foi pedido permitir cadastro e login com e-mail e senha, sem perder o Google. Contas Google e contas com senha com o mesmo e-mail não podem se misturar.

## Decisão

- Credentials provider do NextAuth v4 ao lado do Google (`app/_lib/auth.ts`).
- Hash com `bcryptjs` (v3, custo 10): JS puro, sem binário nativo, funciona no Windows e em serverless, e já traz os próprios tipos.
- `User.password String?` (nula para contas Google). O Prisma omite o campo em toda query (`omit: { user: { password: true } }` em `app/_lib/prisma.ts:3-4`); só o `authorize` o lê, com `omit: { password: false }`.
- Sem vínculo de contas: o conflito de e-mail é bloqueado nos dois sentidos com mensagem clara (sem `allowDangerousEmailAccountLinking`).
- `signInSchema` limita a senha de login a 256 caracteres (`app/_lib/auth-schemas.ts:23`) e exige só que não seja vazia, sem reaplicar as regras de força; a regra de 8 a 72 fica no `passwordSchema` (cadastro).
- Schemas zod compartilhados em `app/_lib/auth-schemas.ts` (sem imports de servidor); mensagens e códigos de erro em `app/_constants/auth.ts`.
- Fora de escopo, risco aceito: verificação de e-mail, recuperação de senha e rate limit.

## Alternativas consideradas

- `bcrypt` nativo: exige build nativo, mais frágil no Windows e em serverless.
- `argon2`: também nativo e sem ganho que justifique aqui.
- Vincular contas Google e senha pelo e-mail: descartado pelo risco de tomada de conta sem verificação de e-mail.

## Consequências

- A senha nunca sai do servidor e fica proibida nas consultas do Neon MCP (`"User".password`).
- O cast `db as unknown as PrismaClient` em `app/_lib/auth.ts:16` existe porque o tipo do cliente com omit não é compatível com o `PrismaAdapter`; o omit continua valendo em runtime.
- Sem rate limit, e-mail inexistente e senha errada são tratados com `compare` contra um hash fixo para reduzir a diferença de tempo.
