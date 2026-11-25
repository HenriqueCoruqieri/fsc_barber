# 0004 — Adoção dos servidores MCP (Neon remoto, modo só leitura)

- Status: aceita
- Data: 2026-11-24

## Contexto

Os agentes precisavam de navegador, documentação atualizada e inspeção do banco.

## Decisão

Adotados MCPs (playwright, context7, neon, next-devtools, shadcn) em `.mcp.json`, com o Neon remoto autenticado por API key de escopo de projeto (`NEON_API_KEY`, fora do repositório). Servidor em modo só leitura (`x-read-only: "true"`): o `run_sql` roda em transação read-only e a escrita pelo MCP fica bloqueada pelo servidor.

## Alternativas consideradas

Não registradas na época.

## Consequências

- Os agentes ganham navegador, documentação atualizada e inspeção do banco.
- As regras da seção "Uso do MCP do Neon" do `rules.md` e a revisão são segunda camada de proteção.
- O point-in-time restore do Neon é o recurso de recuperação.

## Histórico

A configuração inicial (commit `2d89c96`) não tinha modo só leitura e registrava o risco residual de o `run_sql` do Neon aceitar escrita, com proteção só por instrução e revisão. O modo só leitura (`x-read-only: "true"`) foi ativado em seguida (commit `60653d4`); o texto da decisão acima já reflete o estado atual.
