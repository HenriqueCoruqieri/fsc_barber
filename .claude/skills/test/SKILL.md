---
name: test
description: Chama o QA para testar algo fora do fluxo de implementação - as mudanças não commitadas, um arquivo, uma pasta, uma funcionalidade ou o sistema inteiro. Use quando o usuário rodar /test, opcionalmente seguido do alvo.
argument-hint: [arquivo | pasta | funcionalidade | all]
disable-model-invocation: true
---

# /test — Testes avulsos com o QA

Alvo: $ARGUMENTS

Você (sessão principal) é o **orquestrador** (seção 5 do `rules.md`). Não teste nem corrija código você mesmo: quem testa é o agente `qa`. Se o QA encontrar problemas, você **não** corrige nesta skill — o caminho é o `/fix`.

## 1. Definir o alvo
- **Vazio** → mudanças não commitadas (`git status` / `git diff`). Se não houver nenhuma, pergunte com AskUserQuestion: **Rodar regressão completa** / **Informar um alvo**.
- **`all`** → regressão completa do sistema: checks estáticos (tsc, lint, build) + checklist de regressão de `docs/testing.md`.
- **Arquivo ou pasta** existente → os fluxos afetados por esse código (o QA identifica quem o usa e testa esses fluxos no navegador).
- **Descrição de funcionalidade** (ex.: "cancelamento de agendamento") → o QA localiza o código relacionado e testa os fluxos no navegador.

Gere um slug `test-<resumo>` e crie `.claude/flow/<slug>/`.

## 2. Testar
Avise "🧪 QA testando <alvo>…" e chame o `qa` em **modo avulso** com o alvo, o tipo (mudanças | all | arquivo | funcionalidade) e o slug.
- `BLOCKED` (MCP indisponível, `NEON_API_KEY` ausente, `qa:session` falhando ou dev server que não sobe) → mostre o motivo ao usuário; não tente contornar.

## 3. Resultado
Mostre ao usuário de forma resumida:
- Checks: tsc | lint | build | e2e | devtools | banco
- Roteiros executados (resumo)
- Cobertura do alvo: o que foi testado e o que ficou de fora
- **Problemas encontrados**, cada um com arquivo:linha, esperado × obtido

Se houver problemas, para cada um ofereça o comando pronto:
```
/fix <descrição curta do problema>
```
