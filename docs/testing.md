# Testes

Estratégia de validação, usuários de teste, checklist de regressão e evoluções. As regras de segurança do Neon MCP ficam no [`rules.md`](../rules.md) (seção 3, "Uso do MCP do Neon"), porque valem para vários agentes. O comportamento esperado do sistema está em [`business-rules/`](business-rules/README.md).

## Estratégia
Não há runner de testes nem specs salvos. A validação de cada etapa é feita pelo agente `qa` em três camadas:
1. **Checks estáticos:** `npx tsc --noEmit`, `npm run lint`, `npm run build`.
2. **E2E exploratório no navegador** via MCP do Playwright (roteiros com navegação, interação, `browser_snapshot`/screenshot, estados de erro/vazio/loading e viewports 390x844 e 1440x900).
3. **Runtime e banco:** erros e logs do dev server pelo next-devtools (`nextjs_index` + `nextjs_call` com `get_errors`/`get_logs`) e conferência no Neon (`run_sql` só com `SELECT`) do que as mutações gravaram.

Ressalva honesta: o E2E via MCP não fica salvo e pode variar entre rodadas. O checklist abaixo e os roteiros registrados nos relatórios (`qa-report-*.md`, `bug-report.md`) compensam em parte.

## Usuários QA e `qa:session`
- `npm run -s qa:session` cria ou atualiza `qa1@fsc-barber.test` ("QA Tester 1") e `qa2@fsc-barber.test` ("QA Tester 2"), grava neles uma **senha aleatória nova a cada execução** (hash bcrypt) e imprime um JSON no stdout (`baseUrl`, `cookieName`, e por usuário `email`, `name`, `userId`, `sessionToken`, `expires`, `password`). O `sessionToken` é um **JWT** do NextAuth (24h, assinado com `NEXTAUTH_SECRET` do `.env`, obrigatória). Também cria a fixture `qa-google@fsc-barber.test` (sem senha, com `Account` `google` fictício), que sai no JSON só com `email`, `name` e `userId`, para testar os conflitos sem OAuth real. Não cria linhas em `sessions`. É a **única** escrita no banco do fluxo de QA.
- Use sempre `-s` (sem ele o npm quebra o JSON do stdout). O script recusa `NODE_ENV=production` e exige Node >= 22.18.
- `npm run -s qa:session -- --reset` apaga antes as reservas dos usuários QA e dos `qa-signup-*@fsc-barber.test`, e depois esses usuários `qa-signup-*` (o QA o roda ao final de cada execução). Cadastros de teste usam só e-mails `qa-signup-<sufixo>@fsc-barber.test`.
- Com a `password` do JSON o QA testa o login real pelo formulário de credenciais (`/api/auth/signin`). Fontes: `prisma/qa-session.ts`.
- O QA injeta o cookie (`next-auth.session-token`) no Playwright com `browser_run_code_unsafe` (`page.context().addCookies(...)`; único uso permitido dessa ferramenta) ou, se indisponível, `browser_evaluate` com `document.cookie`. O qa2 existe para testar a regra de dono do recurso.
- Para a regressão, o `build` pode rodar com o dev server ativo no Next 16 (o dev usa `.next/dev`); o QA nunca para um dev server que não subiu.
- Dev server: o QA verifica se `http://localhost:3000` responde; se não, sobe `npm run dev` em background e o encerra ao final só se foi ele que o subiu.
- Os tokens de sessão e as senhas do JSON nunca vão para relatórios. A saída do `qa:session` nunca é salva em arquivo (nem com `>`) nem lida por outro meio (ex.: `file://` no navegador). Se algo for negado (permissão, classificador, hook), o QA retorna `BLOCKED` com o motivo e não busca caminho alternativo.

## Neon MCP nos testes
As regras (só leitura, ferramentas permitidas, `project_id`, colunas de credenciais proibidas, só `SELECT`) estão na seção 3 do [`rules.md`](../rules.md). Consulta útil para conferir o que uma mutação gravou (sempre com `LIMIT`, `project_id: "delicate-heart-92192986"`, sem colunas de credenciais, incluindo `"User".password`; para ela só testes booleanos como `password IS NOT NULL` e `password LIKE '$2%'`):

```sql
SELECT b."id", b."serviceId", b."date", u."email"
FROM "Booking" b
JOIN "User" u ON u."id" = b."userId"
WHERE u."email" IN ('qa1@fsc-barber.test', 'qa2@fsc-barber.test')
ORDER BY b."date" DESC
LIMIT 20
```

As tabelas de domínio (`"User"`, `"Booking"`, `"BarbershopService"`, `"Barbershop"`) levam aspas por terem nome maiúsculo; as do NextAuth são minúsculas (`accounts`, `sessions`, `verification_tokens`).

## Checklist de regressão
**Deslogado**
- `/` carrega as barbearias.
- A busca leva a `/barbershops?...` com resultados.
- `/barbershops/[id]` mostra os serviços.
- Tentar agendar pede login.
- `/bookings` deslogado se comporta como hoje.

**Logado (qa1)**
- Criar um agendamento e conferir no banco (`"Booking"`, SELECT).
- O horário ocupado não aparece de novo.
- `/bookings` lista o agendamento.
- Cancelar remove o agendamento da lista e o banco confirma.
- O qa2 não vê nem cancela o agendamento do qa1.

**Login por senha**
- `/api/auth/signin` com qa1 e a senha do `qa:session` entra; senha errada e e-mail inexistente não entram; `qa-google` com qualquer senha dá `error=GOOGLE_ACCOUNT`.
- E-mail com maiúsculas e espaços entra.
- `/api/auth/session` tem `user.id` e nunca `password`.
- "Sair" desloga.

**Sempre**
- `get_errors` do next-devtools sem erros novos.

## Comportamento esperado
O que cada fluxo deve fazer está em [`business-rules/`](business-rules/README.md). Divergência entre o código e a regra documentada é inconformidade (se a etapa mexe naquilo) ou issue no GitHub (https://github.com/HenriqueCoruqieri/fsc_barber/issues).

## Validação documental
Para etapas só de documentação ou de fluxo de agentes (sem código de `app/`), não há E2E nem `qa:session`. A validação confere:
- links relativos que abrem arquivos existentes;
- fidelidade ao código (`arquivo:linha` citados confirmam a regra);
- nada perdido em migrações de conteúdo (comparação com `git show HEAD:<arquivo>`);
- `tools:` dos agentes inalterado;
- `npm run lint` e `npx tsc --noEmit` sem mudanças fora de docs (o erro de lint em `prisma/seed.ts` é pré-existente, registrado em [#6](https://github.com/HenriqueCoruqieri/fsc_barber/issues/6)).

## Evoluções
- Specs `@playwright/test` versionados e, se desejado, um test runner (Vitest) para testes unitários.
- Branch Neon `qa` com dev server dedicado (`QA_DATABASE_URL`; o QA passaria sempre o `branchId` do branch `qa` nas chamadas ao `neon`).
- Injetar o cookie de sessão com `browser_cookie_set` do Playwright (se existir), no lugar de `browser_run_code_unsafe`.
