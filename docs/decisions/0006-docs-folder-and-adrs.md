# 0006 — Pasta docs/ com ADRs e separação rules.md × docs/

- Status: aceita
- Data: 2026-11-24

> Revisão parcial: a parte "problemas conhecidos em `docs/`" foi revista pelo [0007](0007-github-issues-backlog.md); problemas conhecidos e backlog ficam nas GitHub Issues.

## Contexto

O `rules.md` é carregado em toda tarefa via `CLAUDE.md`. Misturar nele regras vigentes com conhecimento de consulta (histórico de decisões, regras de negócio, estratégia de testes, arquitetura, problemas conhecidos) faz o contexto carregado a cada tarefa crescer sem limite.

## Decisão

- `rules.md` guarda as regras curtas e vigentes que todo agente precisa em toda tarefa, com ponteiros para `docs/`.
- `docs/` guarda o conhecimento consultado sob demanda.
- Cada decisão técnica relevante vira um ADR em `docs/decisions/` (`NNNN-<slug>.md`), com índice em `docs/decisions/README.md`. O agente `docs` cria o arquivo e atualiza o índice.
- As decisões que estavam na seção 7 do `rules.md` foram migradas para ADRs (0001 a 0005), preservando data e texto.

## Alternativas consideradas

- Manter tudo no `rules.md`: o contexto carregado a cada tarefa cresce sem limite.
- Wiki externa: fica fora do repositório e os agentes não leem.

## Consequências

- O `rules.md` seção 7 vira só um ponteiro para o índice de ADRs.
- A numeração das seções do `rules.md` é mantida, porque agentes e skills citam seções pelo número.
- Decisões revertidas não são apagadas: o ADR antigo passa a "substituída por NNNN" e o novo cita o antigo.
