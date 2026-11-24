---
name: test
description: Chama o QA para testar algo fora do fluxo de implementação - as mudanças não commitadas, um arquivo, uma pasta, uma funcionalidade ou o sistema inteiro. Use quando o usuário rodar /test, opcionalmente seguido do alvo.
argument-hint: [arquivo | pasta | funcionalidade | all]
disable-model-invocation: true
---

# /test — Testes avulsos com o QA

Alvo: $ARGUMENTS

Você (sessão principal) é o **orquestrador** (seção 5 do `rules.md`). Não escreva testes nem corrija código você mesmo: quem testa é o agente `qa`. Se o QA encontrar problemas, você **não** corrige nesta skill — o caminho é o `/fix`.

## 1. Definir o alvo
- **Vazio** → mudanças não commitadas (`git status` / `git diff`). Se não houver nenhuma, pergunte com AskUserQuestion: **Rodar regressão completa** / **Informar um alvo**.
- **`all`** → regressão completa do sistema (suite de testes, tsc, lint, build), sem escrever testes novos.
- **Arquivo ou pasta** existente → testes unitários desse código.
- **Descrição de funcionalidade** (ex.: "cancelamento de agendamento") → o QA localiza o código relacionado e testa.

Gere um slug `test-<resumo>` e crie `.claude/flow/<slug>/`.

## 2. Testar
Avise "🧪 QA testando <alvo>…" e chame o `qa` em **modo avulso** com o alvo, o tipo (mudanças | all | arquivo | funcionalidade) e o slug.
- `BLOCKED` (sem test runner) → pergunte se pode configurar Vitest + Testing Library (commit próprio `chore: setup vitest and testing library`). Se não, peça ao QA para rodar apenas tsc, lint e build.

## 3. Resultado
Mostre ao usuário de forma resumida:
- Checks: testes | tsc | lint | build
- Testes criados (arquivos)
- Cobertura do alvo: o que foi testado e o que ficou de fora
- **Problemas encontrados**, cada um com arquivo:linha, esperado × obtido

Se houver problemas, para cada um ofereça o comando pronto:
```
/fix <descrição curta do problema>
```

## 4. Commit dos testes (se o QA criou testes)
- Se **todos** os testes novos passam → chame o `commit-manager` com o slug, informando que o relatório é `.claude/flow/<slug>/qa-report.md` e que o commit é do tipo `test`. Pause e pergunte com AskUserQuestion: **Commitar agora** / **Eu mesmo vou commitar** / **Ajustar mensagem** / **Não commitar**.
  - Commitar agora → `git add <arquivos de teste listados>` e `git commit -m "<mensagem>"` só com a linha de assunto. Nunca `--no-verify`.
- Se algum teste novo **falha** (revelou um bug) → não commite esses testes. Explique que eles devem entrar junto com a correção, via `/fix` (o QA pode reaproveitá-los como teste de reprodução).
- Nunca rode `git push` sem pedido explícito.
