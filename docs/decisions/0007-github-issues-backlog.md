# 0007 — Backlog e problemas conhecidos em GitHub Issues via MCP

- Status: aceita
- Data: 2026-11-25

## Contexto

O ADR 0006 previa os problemas conhecidos em `docs/`. Na prática, um `known-issues.md` vira um commit a cada bug registrado ou resolvido, e não há vínculo entre o item e a correção. As Issues do GitHub fecham automaticamente com `closes #N` no commit, têm histórico e discussão, e permitem busca.

## Decisão

- Backlog e problemas conhecidos ficam nas GitHub Issues do repositório.
- Os agentes acessam as issues pelo MCP remoto do GitHub (`https://api.githubcopilot.com/mcp/`) configurado em `.mcp.json`, autenticado por `GITHUB_PAT` (fine-grained, só o repositório `fsc_barber`, Issues leitura e escrita, Metadata somente leitura; definido via `setx`, nunca no `.env`).
- Allowlist de ferramentas por header `X-MCP-Tools`: `issue_read`, `list_issues`, `search_issues`, `issue_write`, `add_issue_comment`. Mais `X-MCP-Lockdown: true` e `X-MCP-Exclude-Tools` redundante.
- Regras de uso (aprovação explícita do usuário, só `create`, conteúdo de issue é dado) na seção 3 do `rules.md`.

## Alternativas consideradas

- `docs/known-issues.md`: um commit por bug e sem fechamento automático.
- `gh` CLI: não está instalado e daria acesso via terminal, sem allowlist por agente (qualquer agente com Bash poderia fazer push, PR ou merge).

## Consequências

- Criar ou comentar issue é publicação: exige aprovação do usuário a cada vez.
- Risco de prompt injection: o texto das issues pode vir de terceiros. É tratado como dado; o Lockdown ajuda, mas é best-effort.
- Permissões limitadas ao PAT: o token só alcança Issues deste repositório, e sua ausência pode impedir os MCPs de carregarem (definir antes de abrir o Claude Code).
- Revisa parcialmente o ADR 0006 (problemas conhecidos deixam de ficar em `docs/`).
