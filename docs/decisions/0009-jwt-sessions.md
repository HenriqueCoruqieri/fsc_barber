# 0009 — Sessão JWT no lugar da sessão de banco

- Status: aceita
- Data: 2026-11-26

## Contexto

O Credentials provider do NextAuth v4 só funciona com `session.strategy: "jwt"`. A sessão estava no banco (tabela `sessions`, `PrismaAdapter`).

## Decisão

- `session: { strategy: "jwt" }` e `secret: process.env.NEXTAUTH_SECRET` (`app/_lib/auth.ts:17,98`). Antes o código lia `NEXT_AUTH_SECRET`, nome errado (issue #9).
- O callback `session` preenche `user.id` com `token.sub` (`app/_lib/auth.ts:89-95`).
- O `qa:session` passa a gerar o cookie como JWT (`encode` de `next-auth/jwt`) com o mesmo `NEXTAUTH_SECRET`, e a injeção de cookie no Playwright continua igual.
- O ADR 0005 (testes via MCP) continua valendo; muda só o mecanismo da sessão de teste.

## Alternativas consideradas

- Manter sessão de banco: inviável com o Credentials provider no NextAuth v4.
- QA sempre logar pelo formulário: deixaria cada roteiro mais lento e frágil.

## Consequências

- Todos os usuários saíram da conta uma vez na troca.
- A tabela `sessions` continua no schema e no adapter, mas não recebe linhas; as antigas ficam órfãs.
- Não há revogação de sessão no servidor; o JWT dura 30 dias (padrão do NextAuth).
- `NEXTAUTH_SECRET` passa a ser obrigatória para o app e para o `qa:session`.
