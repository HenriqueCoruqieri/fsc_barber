# 0003 — Evitar `useEffect` e tipar props com `interface`

- Status: aceita
- Data: 2026-11-23

## Contexto

Efeitos causam renderizações extras e bugs de sincronização quando usados para buscar dados ou derivar estado. Os componentes existentes já tipavam props com `interface`.

## Decisão

Evitar `useEffect` e tipar props com `interface`. As regras vigentes estão em `rules.md`, seção 3 ("Componentes React").

## Alternativas consideradas

Não registradas na época.

## Consequências

- Menos renderizações extras e menos bugs de sincronização de estado.
- A tipagem de props fica padronizada, como já era usada nos componentes existentes.
