# 0005 — Testes via MCP em vez de runner de testes

- Status: aceita
- Data: 2026-11-24

## Contexto

Preferência do usuário por validação E2E no navegador.

## Decisão

Testes via MCP (Playwright, Next DevTools, Neon) em vez de runner de testes, com sessões de teste por `npm run -s qa:session` e agentes com lista explícita de ferramentas MCP (Neon só as de leitura).

## Alternativas consideradas

Runner de testes (citado no texto original como a opção preterida).

## Consequências

- O E2E via MCP não fica salvo e varia entre rodadas; isso é compensado por checklist de regressão e roteiros nos relatórios.
- A escrita no banco fica restrita aos usuários QA pelo script.
- O reviewer bloqueia instruções que liberem escrita via MCP.
