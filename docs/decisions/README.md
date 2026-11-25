# Decisões (ADRs)

Registro das decisões técnicas relevantes do projeto, uma por arquivo (`NNNN-<slug-em-ingles>.md`), em ordem cronológica (0001 = mais antiga).

## Como funciona

- **Quando criar:** toda decisão técnica relevante (adotar ou trocar biblioteca, padrão, ferramenta ou convenção; mudar o fluxo de agentes). O agente `docs` cria o arquivo e atualiza a tabela abaixo.
- **Nunca apagar.** Decisão revertida vira status `substituída por NNNN`, e o novo ADR cita o antigo.
- Referências a "seção X do `rules.md`" em ADRs antigos são registro histórico.

## Template

```md
# NNNN — <título>

- Status: aceita | substituída por NNNN
- Data: AAAA-MM-DD

## Contexto

## Decisão

## Alternativas consideradas

## Consequências
```

## Índice

| Nº | Decisão | Status | Data |
|---|---|---|---|
| [0001](0001-multi-agent-workflow.md) | Fluxo de desenvolvimento multi-agente | aceita | 2026-11-23 |
| [0002](0002-reviewer-before-qa.md) | Agente reviewer antes do QA | aceita | 2026-11-23 |
| [0003](0003-avoid-useeffect-and-interface-props.md) | Evitar `useEffect` e tipar props com `interface` | aceita | 2026-11-23 |
| [0004](0004-mcp-servers.md) | Adoção dos servidores MCP (Neon remoto, modo só leitura) | aceita | 2026-11-24 |
| [0005](0005-mcp-based-testing.md) | Testes via MCP em vez de runner de testes | aceita | 2026-11-24 |
| [0006](0006-docs-folder-and-adrs.md) | Pasta docs/ com ADRs e separação rules.md × docs/ | aceita | 2026-11-24 |
